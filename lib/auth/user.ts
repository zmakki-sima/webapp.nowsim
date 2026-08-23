import "server-only";

import { newUserResponseSchema } from "@/lib/api/schemas";
import { postYesim } from "@/lib/api/yesim";

export async function yesimUserId(email: string): Promise<string> {
  const user = await postYesim("new_user", newUserResponseSchema, {
    params: { email },
  });

  return user.user_id;
}
