import { buildSchema } from "graphql";

export const schema = buildSchema(`
  enum OrderStatus {
    RECEIVED
    PREPARING
    OUT_FOR_DELIVERY
    DELIVERED
    CANCELLED
  }

  type Kitchen {
    id: ID!
    name: String!
    location: String
    isActive: Boolean!
  }

  type Restaurant {
    id: ID!
    name: String!
    kitchenId: ID!
    cuisineType: String
    isActive: Boolean!
  }

  type AuthPayload {
    token: String!
    role: String!
    kitchenId: ID
  }

  input OrderItemInput {
    productId: ID!
    name: String!
    quantity: Int!
    priceSnapshot: Float!
  }

  input KitchenSignupInput {
    kitchenName: String!
    location: String
    email: String!
    password: String!
  }

  input GuestInfoInput {
    name: String
    phone: String
  }

  type Product {
    id: ID!
    name: String!
    price: Float!
  }

  type OrderItem {
    name: String!
    quantity: Int!
    priceSnapshot: Float!
  }

  type Order {
    id: ID!
    orderNumber: String!
    status: OrderStatus!
    createdAt: String!
    items: [OrderItem!]!
    total: Float!
    eta: String!
    etaNotes: String
  }

  # -------------------- QUERY (ONLY ONE) --------------------
  type Query {
    getOrdersByKitchen(kitchenId: ID!): [Order!]!
    getAllKitchens: [Kitchen!]!
    getRestaurantsByKitchen(kitchenId: ID!): [Restaurant!]!
    getProductsByRestaurant(restaurantId: ID!): [Product!]!
    getMyRestaurants: [Restaurant!]!
    getAllRestaurants: [Restaurant!]!
    getOrderById(orderId: ID!): Order
    getOrdersByPhone(phone: String!, verificationToken: String!): [Order!]!

  }

  # -------------------- MUTATION (ONLY ONE) --------------------
  type Mutation {

    updateOrderStatus(
      orderId: ID!
      status: OrderStatus!
    ): Order

    kitchenSignup(input: KitchenSignupInput!): AuthPayload
    login(email: String!, password: String!): AuthPayload

    createKitchen(
      name: String!
      location: String
    ): Kitchen

    createRestaurant(
      name: String!
      kitchenId: ID!
      cuisineType: String
    ): Restaurant

    createOrder(
      kitchenId: ID!
      restaurantId: ID!
      items: [OrderItemInput!]!
      guestInfo: GuestInfoInput
    ): Order

    createProduct(
      restaurantId: ID!
      name: String!
      price: Float!
    ): Product

    updateOrderETA(
      orderId: ID!
      eta: String!
      notes: String
    ): Order

    cancelOrder(
      orderId: ID!
      reason: String!
    ): Order

  }
`);
