// hooks/useNotificationCount.ts
import useSWR from "swr";
import { useUser } from "@/context/UserContext";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function useNotificationCount() {
  const { user } = useUser();

  const { data, error } = useSWR(
    user?.phone ? `/api/notifications/user?phone=${user.phone}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );

  const unseenCount = data?.notifications?.filter((n: any) => !n.seen)?.length || 0;

  return { unseenCount, error };
}
