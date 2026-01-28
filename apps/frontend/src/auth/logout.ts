export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  localStorage.removeItem("kitchenId");

  // hard reload clears Apollo cache + sockets
  window.location.href = "/login";
};
