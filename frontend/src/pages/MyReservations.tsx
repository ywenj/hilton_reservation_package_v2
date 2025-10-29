import React from "react";
import { useQuery } from "@apollo/client";
import { Table, Tag, Typography } from "antd";
import { QUERY_MY_RESERVATIONS } from "../graphql/queries";

export default function MyReservationsPage() {
  const { data, loading } = useQuery(QUERY_MY_RESERVATIONS);

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>我的预订</Typography.Title>
      <Table
        loading={loading}
        dataSource={(data?.myReservations || []) as any[]}
        rowKey={(r: any) => r._id}
        columns={[
          { title: "到店时间", dataIndex: "expectedArrival" },
          { title: "人数", dataIndex: "tableSize" },
          {
            title: "状态",
            dataIndex: "status",
            render: (s: string) => <Tag>{s}</Tag>,
          },
        ]}
      />
    </div>
  );
}
