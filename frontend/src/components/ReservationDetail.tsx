import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  QUERY_RESERVATION,
  MUTATION_UPDATE,
  MUTATION_SET_STATUS,
} from "../graphql/queries";
import { StatusBadge } from "./StatusBadge";
import {
  Card,
  Descriptions,
  Button,
  Space,
  notification,
  Divider,
  Typography,
} from "antd";
import dayjs from "dayjs"; // still used for update computations
import { formatDateTime } from "../utils/datetime";

export const ReservationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(QUERY_RESERVATION, {
    variables: { id },
    skip: !id,
  });
  const [updateReservation] = useMutation(MUTATION_UPDATE);
  const [setStatus] = useMutation(MUTATION_SET_STATUS);
  const [api, contextHolder] = notification.useNotification();

  if (!id) return <Card>Missing ID</Card>;
  if (loading) return <Card>Loading...</Card>;
  if (error) return <Card>Error: {error.message}</Card>;
  const r = data?.reservation;
  if (!r) return <Card>Not found</Card>;

  const changeStatus = async (status: string) => {
    try {
      await setStatus({ variables: { id, status, version: r.version } });
      api.success({
        message: "Status updated",
        description: `New status: ${status}`,
      });
    } catch (err: any) {
      api.error({ message: "Failed", description: err.message });
    }
  };

  const bumpTableSize = async () => {
    try {
      await updateReservation({
        variables: {
          id,
          input: { tableSize: r.tableSize + 1, version: r.version },
        },
      });
      api.success({ message: "Table size increased" });
    } catch (err: any) {
      api.error({ message: "Update failed", description: err.message });
    }
  };

  return (
    <Card
      style={{
        maxWidth: 760,
        margin: "0 auto",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        borderRadius: 12,
      }}
      bodyStyle={{ padding: 24 }}
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Button size="small" onClick={() => navigate(-1)}>
            Back
          </Button>
          <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>
            {r.guestName}
          </Typography.Text>
          <StatusBadge status={r.status} />
        </div>
      }
      extra={
        <Space>
          <Button size="small" onClick={bumpTableSize}>
            + Table Size
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => changeStatus("Confirmed")}
          >
            Confirm
          </Button>
          <Button size="small" danger onClick={() => changeStatus("Cancelled")}>
            Cancel
          </Button>
          <Button size="small" onClick={() => changeStatus("Completed")}>
            Complete
          </Button>
        </Space>
      }
    >
      {contextHolder}
      <Descriptions
        bordered
        size="small"
        column={2}
        labelStyle={{ width: 160, fontWeight: 500 }}
        contentStyle={{ minWidth: 180 }}
      >
        <Descriptions.Item label="Guest Name">{r.guestName}</Descriptions.Item>
        <Descriptions.Item label="Contact Phone">
          {r.contactPhone}
        </Descriptions.Item>
        {r.contactEmail && (
          <Descriptions.Item label="Contact Email">
            {r.contactEmail}
          </Descriptions.Item>
        )}
        <Descriptions.Item label="Expected Arrival">
          {formatDateTime(r.expectedArrival)}
        </Descriptions.Item>
        <Descriptions.Item label="Table Size">{r.tableSize}</Descriptions.Item>
        <Descriptions.Item label="Status">{r.status}</Descriptions.Item>
      </Descriptions>
      <Divider style={{ margin: "24px 0" }} />
      <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
        Manage reservation actions from the top bar. Status changes are
        immediate.
      </Typography.Paragraph>
    </Card>
  );
};
