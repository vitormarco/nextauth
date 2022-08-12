import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { withSSRAuth } from "../utils/withSSRAuth";
import { setupApiClient } from "../services/api";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return <h1>Dashboard: {user?.email}</h1>;
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupApiClient(ctx);
  const response = await apiClient.get("/me");

  return {
    props: {},
  };
});

export default Dashboard;
