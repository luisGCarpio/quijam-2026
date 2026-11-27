import { BQ360Provider } from "@/context/BQ360Context";
import { AppShell } from "@/components/shell/AppShell";

export default function Home() {
  return (
    <BQ360Provider>
      <AppShell />
    </BQ360Provider>
  );
}
