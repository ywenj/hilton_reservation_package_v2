import React from "react";
import { Tag } from "antd";
import { ReservationStatus, statusColors } from "../types/reservation";

const antColorMap: Record<ReservationStatus, string> = {
  Requested: "processing",
  Confirmed: "success",
  Seated: "geekblue",
  Completed: "default",
  Cancelled: "error",
};

export const StatusBadge: React.FC<{ status: ReservationStatus }> = ({
  status,
}) => {
  return (
    <Tag
      color={antColorMap[status]}
      style={{ minWidth: 90, textAlign: "center" }}
    >
      {status}
    </Tag>
  );
};
