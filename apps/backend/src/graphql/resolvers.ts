import { Order } from "../modules/order/order.model";
import { canUpdateOrderStatus } from "../modules/order/order.flow";
import { OrderStatus } from "@ghost/shared-types";
import { io } from "../server";
import { getKitchenActiveOrders, getKitchenHistoryOrders } from "../modules/order/order.aggregation";
import { AuthRequest } from "../middleware/auth";
import { requireKitchenAccess, requireKitchenOrAdmin } from "../middleware/role";
import jwt from "jsonwebtoken";
import { User } from "../modules/user/user.model";
import { Kitchen } from "../modules/kitchen/kitchen.model";
import { UserRole } from "@ghost/shared-types";
import { Restaurant } from "../modules/restaurant/restaurant.model";
import { requireAdmin } from "../middleware/role";
import { Product } from "../modules/product/product.module";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { OTP } from "../modules/otp/otp.model";
import { Cuisine } from "../modules/cuisine/cuisine.model";

const mapOrder = (order: any) => ({
    id: order._id.toString(),
    orderNumber: order.orderNumber,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
    items: order.items,
    total: order.total,
    eta: order.eta?.toISOString(),
    etaNotes: order.etaNotes ?? null,
    deliveredAt: order.deliveredAt ? order.deliveredAt.toISOString() : null
});

export const root = {
    getOrdersByKitchen: async ({ kitchenId }: { kitchenId: string }, req: AuthRequest) => {
        requireKitchenAccess(req, kitchenId);

        const orders = await getKitchenActiveOrders(kitchenId);
        return orders.map(mapOrder);
    },

    getOrderHistoryByKitchen: async (
        { kitchenId }: { kitchenId: string },
        req: AuthRequest
    ) => {
        requireKitchenAccess(req, kitchenId);

        // return Order.find({
        //     kitchenId,
        //     status: { $in: ["DELIVERED", "CANCELLED"] }
        // }).sort({ createdAt: -1 });
        const orders = await getKitchenHistoryOrders(kitchenId);
        return orders.map(mapOrder);
    },

    updateOrderStatus: async ({ orderId, status }: {
        orderId: string;
        status: OrderStatus;
    }) => {
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");

        if (!canUpdateOrderStatus(order.status as OrderStatus, status)) {
            throw new Error("Invalid order status transition");
        }

        order.status = status;
        if (status === "DELIVERED") {
            order.deliveredAt = new Date();
        }
        await order.save();

        // 🔔 REAL-TIME EVENT (THIS IS THE LINE)
        io.to(order.id).emit("ORDER_UPDATED", {
            orderId: order.id,
            status: order.status
        });

        return mapOrder(order);

    },

    createOrder: async ({
        kitchenId,
        restaurantId,
        items,
        guestInfo
    }: {
        kitchenId: string;
        restaurantId: string;
        items: any;
        guestInfo: any;
    }) => {
        const total = items.reduce((sum: number, item: { priceSnapshot: number; quantity: number; }) => sum + item.priceSnapshot * item.quantity, 0);

        const order = await Order.create({
            orderNumber: `ORD-${Date.now()}`,
            kitchenId,
            restaurantId,
            items,
            total,
            guestInfo,
            eta: new Date(Date.now() + 30 * 60 * 1000) // 30 min
        });

        io.to(order.id).emit("NEW_ORDER", mapOrder(order));
        io.to(kitchenId).emit("NEW_ORDER", mapOrder(order));

        return mapOrder(order);
    },


    login: async ({
        email,
        password
    }: {
        email: string;
        password: string;
    }) => {
        // 1️⃣ Find user
        const user = await User.findOne({ email });
        if (!user) throw new Error("Invalid credentials");

        // 2️⃣ Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) throw new Error("Invalid credentials");

        // 3️⃣ Create JWT
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                kitchenId: user.kitchenId
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        // 4️⃣ Return auth payload
        return {
            token,
            role: user.role,
            kitchenId: user.kitchenId
        };
    },

    kitchenSignup: async ({
        input
    }: {
        input: {
            kitchenName: string;
            location?: string;
            email: string;
            password: string;
        };
    }) => {
        // 1️⃣ Prevent duplicate signup
        const existingUser = await User.findOne({ email: input.email });
        if (existingUser) {
            throw new Error("Email already registered");
        }

        // 2️⃣ Create Kitchen
        const kitchen = await Kitchen.create({
            name: input.kitchenName,
            location: input.location
        });

        // 3️⃣ Hash password
        const hashedPassword = await bcrypt.hash(input.password, 10);

        // 4️⃣ Create Kitchen user (tenant-scoped)
        const user = await User.create({
            email: input.email,
            password: hashedPassword,
            role: UserRole.KITCHEN,
            kitchenId: kitchen.id
        });

        // 5️⃣ Create JWT
        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
                kitchenId: kitchen.id
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" }
        );

        // 6️⃣ Return auth payload
        return {
            token,
            role: user.role,
            kitchenId: kitchen.id
        };
    },

    getAllKitchens: async (_: any, req: AuthRequest) => {
        requireAdmin(req);
        return Kitchen.find();
    },

    getRestaurantsByKitchen: async (
        { kitchenId }: { kitchenId: string },
        req: AuthRequest
    ) => {
        requireAdmin(req);
        return Restaurant.find({ kitchenId });
    },

    createKitchen: async (
        { name, location }: { name: string; location?: string },
        req: AuthRequest
    ) => {
        requireAdmin(req);
        return Kitchen.create({ name, location });
    },

    createRestaurant: async (
        {
            name,
            kitchenId,
            cuisines
        }: {
            name: string;
            kitchenId: string;
            cuisines: string[];
        },
        req: AuthRequest
    ) => {
        requireAdmin(req);
        // ✅ Validate cuisines
        const validCuisines = await Cuisine.find({
            name: { $in: cuisines },
            isActive: true
        });

        if (validCuisines.length !== cuisines.length) {
            throw new Error("Invalid cuisine selected");
        }

        return Restaurant.create({
            name,
            kitchenId,
            cuisines
        });
    },

    getProductsByRestaurant: async ({
        restaurantId
    }: {
        restaurantId: string;
    }) => {
        const products = await Product.find({
            restaurantId,
            isAvailable: true
        });

        return products.map((product) => ({
            id: product._id.toString(),
            name: product.name,
            price: product.price
        }));
    },

    createProduct: async (
        {
            restaurantId,
            name,
            price
        }: {
            restaurantId: string;
            name: string;
            price: number;
        },
        req: AuthRequest
    ) => {
        const restaurant = await Restaurant.findById(restaurantId);
        if (!restaurant) throw new Error("Restaurant not found");

        // 🔥 FIX IS HERE
        requireKitchenOrAdmin(req, restaurant.kitchenId.toString());

        const product = await Product.create({
            restaurantId,
            name,
            price
        });

        return {
            id: product._id.toString(),
            name: product.name,
            price: product.price
        };
    },

    getMyRestaurants: async (_: any, req: AuthRequest) => {
        const kitchenId = req.user!.kitchenId;
        if (!req.user?.kitchenId) throw new Error("Kitchen ID is required");
        requireKitchenAccess(req, req.user.kitchenId);

        const restaurants = await Restaurant.find({ kitchenId });

        return restaurants.map((r) => ({
            id: r._id.toString(),
            name: r.name,
            kitchenId: r.kitchenId,
            cuisines: r.cuisines,
            isActive: r.isActive
        }));
    },

    getAllRestaurants: async () => {
        const restaurants = await Restaurant.find({ isActive: true });

        return restaurants.map((r) => ({
            id: r._id.toString(),
            name: r.name,
            cuisines: r.cuisines,
            kitchenId: r.kitchenId,
            isActive: r.isActive
        }));
    },

    getOrderById: async ({ orderId }: { orderId: string }) => {
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");

        return mapOrder(order);
    },

    updateOrderETA: async (
        { orderId, eta, note }: { orderId: string; eta: string; note?: string },
        req: AuthRequest
    ) => {
        if (!req.user?.kitchenId) throw new Error("Kitchen ID is required");
        requireKitchenAccess(req, req.user.kitchenId);


        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");

        order.eta = new Date(eta);
        order.etaNotes = note;
        await order.save();

        const mapped = mapOrder(order);

        io.to(order.id).emit("ETA_UPDATED", {
            orderId: order.id,
            eta: mapped.eta,
            note: mapped.etaNotes
        });

        return mapped;
    },

    cancelOrder: async (
        { orderId, reason }: { orderId: string; reason: string },
        req: AuthRequest
    ) => {
        const order = await Order.findById(orderId);
        if (!order) throw new Error("Order not found");

        const role = req.user?.role;

        // 🚫 Already final
        if (
            order.status === "DELIVERED" || order.status === "CANCELLED"
        ) {
            throw new Error("Order cannot be cancelled");
        }

        // CUSTOMER RULE
        if (role === "CUSTOMER" && order.status !== "RECEIVED") {
            throw new Error("Too late to cancel");
        }

        // KITCHEN RULE
        if (
            role === "KITCHEN" &&
            order.status === "OUT_FOR_DELIVERY"
        ) {
            throw new Error("Too late to cancel");
        }

        order.status = OrderStatus.CANCELLED;
        order.cancelReason = reason;
        order.cancelledBy = role ?? "SYSTEM";
        await order.save();

        const mapped = mapOrder(order);

        // 🔔 Notify both customer & kitchen
        io.to(order.id).emit("ORDER_CANCELLED", mapped);
        io.to(order.kitchenId.toString()).emit(
            "ORDER_CANCELLED",
            mapped
        );

        return mapped;
    },

    getOrdersByPhone: async ({
        phone,
        verificationToken
    }: {
        phone: string;
        verificationToken: string;
    }) => {
        const expected = crypto
            .createHash("sha256")
            .update(phone + process.env.JWT_SECRET)
            .digest("hex");

        if (verificationToken !== expected) {
            throw new Error("Unauthorized");
        }

        const orders = await Order.find({
            "guestInfo.phone": phone
        }).sort({ createdAt: -1 });

        return orders.map(mapOrder);
    },

    updateProduct: async (
        {
            productId,
            name,
            price
        }: {
            productId: string;
            name: string;
            price: number;
        },
        req: AuthRequest
    ) => {
        // Only Kitchen/Admin
        if (!req.user || !["KITCHEN", "ADMIN"].includes(req.user.role)) {
            throw new Error("Unauthorized");
        }

        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");

        product.name = name;
        product.price = price;
        await product.save();

        return product;
    },

    deleteProduct: async (
        { productId }: { productId: string },
        req: AuthRequest
    ) => {
        if (!req.user || !["KITCHEN", "ADMIN"].includes(req.user.role)) {
            throw new Error("Unauthorized");
        }

        const product = await Product.findById(productId);
        if (!product) throw new Error("Product not found");

        // Soft delete (recommended)
        product.isAvailable = false;
        await product.save();

        return true;
    },

    toggleKitchenStatus: async (
        { kitchenId, isActive }: { kitchenId: string; isActive: boolean },
        req: AuthRequest
    ) => {
        requireAdmin(req);

        const kitchen = await Kitchen.findById(kitchenId);
        if (!kitchen) throw new Error("Kitchen not found");

        kitchen.isActive = isActive;
        await kitchen.save();

        return kitchen;
    },

    getCuisines: async (
        { activeOnly }: { activeOnly?: boolean }
    ) => {
        if (activeOnly) {
            return Cuisine.find({ isActive: true });
        }
        return Cuisine.find();
    },

    createCuisine: async (
        { name }: { name: string },
        req: any
    ) => {
        requireAdmin(req);

        return Cuisine.create({ name });
    },

    toggleCuisine: async (
        { id, isActive }: { id: string; isActive: boolean },
        req: any
    ) => {
        requireAdmin(req);

        return Cuisine.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );
    }

};
