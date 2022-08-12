import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { withSSRAuth } from "../utils/withSSRAuth";
import { setupApiClient } from "../services/api";
import { useCan } from "../hooks/useCan";

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const userCanSeeMetrics = useCan({
    roles: ["administrator", "editor"],
  });

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      {userCanSeeMetrics && <div>Métricas</div>}
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
