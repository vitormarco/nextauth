import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { withSSRAuth } from "../utils/withSSRAuth";
import { setupApiClient } from "../services/api";
import { Can } from "../components/Can";

const Dashboard = () => {
  const { user, signOut } = useContext(AuthContext);

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      <button onClick={signOut}>Sign out</button>

      <Can permissions={["metrics.list"]}>
        <div>Métricas</div>
      </Can>
    </>
  );
};

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupApiClient(ctx);

  const response = await apiClient.get("/me");

  console.log(response.data);

  return {
    props: {},
  };
});

export default Dashboard;
