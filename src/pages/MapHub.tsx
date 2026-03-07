import { Navigate } from "react-router-dom";

// MapHub is now a tab inside /projects
const MapHub = () => <Navigate to="/projects?tab=map" replace />;

export default MapHub;
