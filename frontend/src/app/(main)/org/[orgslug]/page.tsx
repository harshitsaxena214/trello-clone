import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";

const Dashboardpage = () => {
  const router = useRouter();
  useEffect(() => {
    const {data} = api.get("/")
  }, []);
  return <div>Dashboardpage</div>;
};

export default Dashboardpage;
