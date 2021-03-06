import merge from "lodash/merge";
import ReactApexChart from "react-apexcharts";
// @mui
import { Card, useTheme } from "@mui/material";
// utils
import { fNumber } from "../../../../utils/formatNumber";
// components
import { BaseOptionChart } from "components/chart";
import { ClubEvent } from "pages/Clubs/data.t";
import useLocales from "hooks/useLocales";

// ----------------------------------------------------------------------

interface EventChartProps {
  event: ClubEvent;
}

export default function EventChart({ event }: EventChartProps) {
  const total = event.slot;
  const theme = useTheme();
  const chartSeries = (event.voteCount / total) * 100;
  const { translate } = useLocales();
  const chartOptions: any = merge(BaseOptionChart(), {
    legend: { show: false },
    grid: {
      padding: { top: -32, bottom: -32 },
    },
    fill: {
      type: "gradient",
      gradient: {
        colorStops: [
          [theme.palette.primary.light, theme.palette.primary.main],
        ].map((colors) => [
          { offset: 0, color: colors[0] },
          { offset: 100, color: colors[1] },
        ]),
      },
    },
    plotOptions: {
      radialBar: {
        hollow: { size: "64%" },
        dataLabels: {
          name: { offsetY: -16 },
          value: { offsetY: 8 },
          total: {
            label: translate("club.event.details.slot"),
            formatter: () => `${fNumber(event.voteCount)}/${fNumber(total)}`,
          },
        },
      },
    },
  });

  return (
    <Card sx={{ py: 3 }}>
      <ReactApexChart
        type="radialBar"
        series={[chartSeries]}
        options={chartOptions}
        height={310}
      />
    </Card>
  );
}
