import React, { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { QUERY_RESERVATIONS, MUTATION_SET_STATUS } from "../graphql/queries";
import {
  DatePicker,
  Select,
  Table,
  Tag,
  Button,
  Space,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";

const STATUS_OPTIONS = [
  "Requested",
  "Confirmed",
  "Seated",
  "Completed",
  "Cancelled",
];

export default function AdminReservationsPage() {
  const [date, setDate] = useState<string | undefined>();
  const [status, setStatus] = useState<string | undefined>();
  const { data, loading, refetch } = useQuery(QUERY_RESERVATIONS, {
    variables: { date, status },
  });
  const [setStatusMutation, { loading: updating }] =
    useMutation(MUTATION_SET_STATUS);

  const onStatusChange = async (id: string, newStatus: string) => {
    try {
      await setStatusMutation({ variables: { id, status: newStatus } });
      message.success("状态已更新");
      refetch();
    } catch (e: any) {
      message.error(e.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={3}>预订管理</Typography.Title>
      <Space style={{ marginBottom: 16 }} wrap>
        <DatePicker
          value={date ? dayjs(date) : undefined}
          onChange={(d) => setDate(d ? d.format("YYYY-MM-DD") : undefined)}
        />
        <Select
          allowClear
          placeholder="状态过滤"
          style={{ width: 160 }}
          value={status}
          onChange={setStatus}
          options={STATUS_OPTIONS.map((s) => ({ value: s, label: s }))}
        />
        <Button onClick={() => refetch()} type="default">
          刷新
        </Button>
      </Space>
      <Table
        loading={loading}
        dataSource={(data?.reservations || []) as any[]}
        rowKey={(r: any) => r._id}
        columns={[
          { title: "姓名", dataIndex: "guestName" },
          { title: "电话", dataIndex: "contactPhone" },
          { title: "到店时间", dataIndex: "expectedArrival" },
          { title: "人数", dataIndex: "tableSize" },
          {
            title: "状态",
            dataIndex: "status",
            render: (s: string) => <Tag>{s}</Tag>,
          },
          {
            title: "操作",
            render: (_: any, r: any) => (
              <Space>
                {STATUS_OPTIONS.filter((ns) => ns !== r.status).map((ns) => (
                  <Button
                    size="small"
                    loading={updating}
                    key={ns}
                    onClick={() => onStatusChange(r._id, ns)}
                  >
                    {ns}
                  </Button>
                ))}
              </Space>
            ),
          },
        ]}
      />
    </div>
  );
}
