export const logout = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("kitchen_token");
  localStorage.removeItem("customer_token");
  localStorage.removeItem("role");
  localStorage.removeItem("kitchenId");

  // hard reload clears Apollo cache + sockets
  window.location.href = "/login";
};
