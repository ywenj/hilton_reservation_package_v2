import React, { useMemo } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  QUERY_RESERVATIONS,
  QUERY_MY_RESERVATIONS,
  MUTATION_SET_STATUS,
} from "../graphql/queries";
import { Reservation, ReservationStatus } from "../types/reservation";
import { StatusBadge } from "./StatusBadge";
import { Link } from "react-router-dom";
import {
  Table,
  Button,
  Space,
  DatePicker,
  Select,
  Typography,
  Dropdown,
} from "antd";
import { useAuth } from "../auth/AuthContext";
import dayjs from "dayjs";

interface Props {
  date?: string;
  status?: string;
}

export const ReservationList: React.FC<Props> = ({ date, status }) => {
  const { user } = useAuth();
  const isEmployee = user?.role === "employee";

  const { data, loading, error, refetch } = useQuery(
    isEmployee ? QUERY_RESERVATIONS : QUERY_MY_RESERVATIONS,
    {
      variables: isEmployee ? { date, status } : undefined,
      fetchPolicy: "cache-and-network",
    },
  );

  const [setStatus] = useMutation(MUTATION_SET_STATUS, {
    onError: (e) => console.error(e),
    // Optimistic refetch
    onCompleted: () => refetch(),
  });

  const reservations: Reservation[] = data?.reservations || [];

  const allStatuses: ReservationStatus[] = [
    "Requested",
    "Confirmed",
    "Seated",
    "Completed",
    "Cancelled",
  ];

  const columns = useMemo(
    () => [
      {
        title: "Guest",
        dataIndex: "guestName",
        key: "guestName",
        render: (text: string, r: Reservation) => (
          <Link to={`/reservations/${r._id}`}>{text}</Link>
        ),
      },
      {
        title: "Arrival",
        dataIndex: "expectedArrival",
        key: "expectedArrival",
        render: (value: string) => dayjs(value).format("YYYY-MM-DD HH:mm"),
        sorter: (a: Reservation, b: Reservation) =>
          dayjs(a.expectedArrival).valueOf() -
          dayjs(b.expectedArrival).valueOf(),
      },
      {
        title: "Size",
        dataIndex: "tableSize",
        key: "tableSize",
        width: 80,
        sorter: (a: Reservation, b: Reservation) => a.tableSize - b.tableSize,
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        filters: allStatuses.map((s) => ({ text: s, value: s })),
        onFilter: (value: any, record: Reservation) => record.status === value,
        render: (_: any, r: Reservation) => <StatusBadge status={r.status} />,
      },
      {
        title: "Actions",
        key: "actions",
        render: (_: any, r: Reservation) => (
          <Space size="small">
            <Link to={`/reservations/${r._id}`}>View</Link>
            {isEmployee && (
              <Dropdown
                menu={{
                  items: allStatuses.map((s) => ({
                    key: s,
                    label: s,
                    onClick: () =>
                      setStatus({
                        variables: { id: r._id, status: s, version: r.version },
                      }),
                  })),
                }}
              >
                <Button size="small">Set Status</Button>
              </Dropdown>
            )}
          </Space>
        ),
      },
    ],
    [isEmployee],
  );

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Button onClick={() => refetch()} loading={loading} type="primary">
          Refresh
        </Button>
        {isEmployee && (
          <>
            <DatePicker
              placeholder="Filter date"
              onChange={(d) => {
                refetch({
                  date: d ? d.format("YYYY-MM-DD") : undefined,
                  status,
                });
              }}
            />
            <Select
              allowClear
              placeholder="Status"
              style={{ width: 140 }}
              onChange={(val) => refetch({ date, status: val })}
              options={allStatuses.map((s) => ({ label: s, value: s }))}
            />
          </>
        )}
        {error && (
          <Typography.Text type="danger">{error.message}</Typography.Text>
        )}
      </Space>
      <Table
        rowKey="_id"
        size="small"
        loading={loading}
        dataSource={reservations}
        columns={columns}
        pagination={{ pageSize: 10 }}
        locale={{ emptyText: "No reservations" }}
      />
    </div>
  );
};
