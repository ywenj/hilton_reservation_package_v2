import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import {
  QUERY_RESERVATION,
  MUTATION_UPDATE,
  MUTATION_SET_STATUS,
} from "../graphql/queries";
import { StatusBadge } from "./StatusBadge";
import { Card, Descriptions, Button, Space, notification } from "antd";
import dayjs from "dayjs";

export const ReservationDetail: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, loading, error } = useQuery(QUERY_RESERVATION, {
    variables: { id },
  });
  const [updateReservation] = useMutation(MUTATION_UPDATE);
  const [setStatus] = useMutation(MUTATION_SET_STATUS);

  if (!id) return <Card>Missing ID</Card>;
  if (loading) return <Card>Loading...</Card>;
  if (error) return <Card>Error: {error.message}</Card>;

  const r = data?.reservation;
  if (!r) return <Card>Not found</Card>;

  const [api, contextHolder] = notification.useNotification();

  const changeStatus = async (status: string) => {
    try {
      await setStatus({ variables: { id, status } });
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
        variables: { id, input: { tableSize: r.tableSize + 1 } },
      });
      api.success({ message: "Table size increased" });
    } catch (err: any) {
      api.error({ message: "Update failed", description: err.message });
    }
  };

  return (
    <Card
      title={
        <Space>
          <Button onClick={() => navigate(-1)}>Back</Button>
          {r.guestName} <StatusBadge status={r.status} />
        </Space>
      }
      style={{ maxWidth: 700, margin: "0 auto" }}
    >
      {contextHolder}
      <Descriptions
        bordered
        size="small"
        column={1}
        labelStyle={{ width: 160 }}
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
          {dayjs(r.expectedArrival).format("YYYY-MM-DD HH:mm")}
        </Descriptions.Item>
        <Descriptions.Item label="Table Size">{r.tableSize}</Descriptions.Item>
      </Descriptions>
      <Space style={{ marginTop: 16 }} wrap>
        <Button onClick={bumpTableSize}>+ Table Size</Button>
        <Button onClick={() => changeStatus("Confirmed")} type="primary">
          Confirm
        </Button>
        <Button onClick={() => changeStatus("Cancelled")} danger>
          Cancel
        </Button>
        <Button onClick={() => changeStatus("Completed")}>Complete</Button>
      </Space>
    </Card>
  );
};
