import { gql } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useState } from "react";
import Modal from "../../components/ui/Modal";
import { useQuery, useMutation } from "@apollo/client/react";

/* ---------------- GraphQL ---------------- */

const GET_PRODUCTS = gql`
  query GetProductsByRestaurant($restaurantId: ID!) {
    getProductsByRestaurant(restaurantId: $restaurantId) {
      id
      name
      price
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $restaurantId: ID!
    $name: String!
    $price: Float!
  ) {
    createProduct(
      restaurantId: $restaurantId
      name: $name
      price: $price
    ) {
      id
      name
      price
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct(
    $productId: ID!
    $name: String!
    $price: Float!
  ) {
    updateProduct(
      productId: $productId
      name: $name
      price: $price
    ) {
      id
      name
      price
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($productId: ID!) {
    deleteProduct(productId: $productId)
  }
`;

/* ---------------- Types ---------------- */

type Product = {
  id: string;
  name: string;
  price: number;
};

/* ---------------- Page ---------------- */

export default function RestaurantProductPage() {
  const { restaurantId } = useParams();

  const { data, refetch, loading } = useQuery<{
    getProductsByRestaurant: Product[];
  }>(GET_PRODUCTS, {
    variables: { restaurantId }
  });

  const [createProduct] = useMutation(CREATE_PRODUCT);
  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  /* ---------------- Modal State ---------------- */

  const [open, setOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | "">("");

  const openAdd = () => {
    setEditingProduct(null);
    setName("");
    setPrice("");
    setOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setName(product.name);
    setPrice(product.price);
    setOpen(true);
  };

  const handleSave = async () => {
    if (!name || !price) return;

    if (editingProduct) {
      await updateProduct({
        variables: {
          productId: editingProduct.id,
          name,
          price: Number(price)
        }
      });
    } else {
      await createProduct({
        variables: {
          restaurantId,
          name,
          price: Number(price)
        }
      });
    }

    setOpen(false);
    refetch();
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Delete this product?")) return;

    await deleteProduct({
      variables: { productId }
    });

    refetch();
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Products</h1>

        <button
          onClick={openAdd}
          className="
            flex items-center gap-2
            px-5 py-3
            rounded-xl
            bg-gradient-to-r from-indigo-500 to-purple-600
            text-white font-medium
            shadow-lg
            hover:scale-[1.02]
            hover:shadow-xl
            transition
          "
        >
          <span className="text-xl">+</span>
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      {loading && (
        <p className="text-gray-400">Loading products…</p>
      )}

      {data?.getProductsByRestaurant.length === 0 && (
        <p className="text-gray-400 text-center">
          No products yet. Add your first one 🍔
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {data?.getProductsByRestaurant.map((product: Product) => (
          <div
            key={product.id}
            className="
              group relative
              rounded-xl
              bg-gray-900
              border border-gray-700
              p-4
              transition
              hover:-translate-y-1
              hover:shadow-xl
            "
          >
            {/* Hover Actions */}
            <div
              className="
                absolute top-3 right-3
                flex gap-2
                opacity-0
                group-hover:opacity-100
                transition
              "
            >
              <button
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs"
                onClick={() => openEdit(product)}
              >
                EDIT
              </button>

              <button
                className="p-2 rounded-lg bg-red-800 hover:bg-red-700 text-xs"
                onClick={() => handleDelete(product.id)}
              >
                DELETE
              </button>
            </div>

            {/* Product Info */}
            <h3 className="font-medium text-white">
              {product.name}
            </h3>

            <span className="
              inline-block mt-2
              px-3 py-1 text-sm
              rounded-full
              bg-indigo-900
              text-indigo-300
            ">
              ₹{product.price}
            </span>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={
          editingProduct ? "Edit Product" : "Add Product"
        }
      >
        <div className="space-y-4">
          <input
            className="input"
            placeholder="Product name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="input"
            type="number"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />

          <div className="flex gap-3 pt-2">
            <button
              className="btn-secondary flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button
              className="btn-primary flex-1"
              disabled={!name || !price}
              onClick={handleSave}
            >
              {editingProduct ? "Save" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
