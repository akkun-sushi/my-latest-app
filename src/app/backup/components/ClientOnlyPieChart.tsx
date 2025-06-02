// "use client";

// import { useEffect, useState } from "react";
// import { PieChart, Pie, Cell } from "recharts";

// const COLORS = ["#6366f1", "#4b5563"];

// export default function ClientOnlyPieChart() {
//   const [isMounted, setIsMounted] = useState(false);
//   const pieData = [
//     { name: "覚えた", value: 180 },
//     { name: "未記憶", value: 120 },
//   ];

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   if (!isMounted) return null;

//   return (
//     <PieChart width={250} height={250}>
//       <Pie
//         data={pieData}
//         cx="50%"
//         cy="50%"
//         outerRadius={80}
//         dataKey="value"
//         label
//         isAnimationActive={false}
//       >
//         {pieData.map((entry, index) => (
//           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//         ))}
//       </Pie>
//     </PieChart>
//   );
// }
