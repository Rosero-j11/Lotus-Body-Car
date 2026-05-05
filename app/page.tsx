import { createClient } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";
import HomeContent from "./HomeContent";

export default function Page() {
  // const cookieStore = await cookies();
  //const supabase = createClient(cookieStore);

  //const { data: todos } = await supabase.from("todos").select();

  return (
    <>
      <HomeContent />
    </>
  );
}
