/** Generated Stage B assets live beside the hand-made ones, under assets/gen/<target>. */
import { assetUrl } from "../ui/format";

export { assetUrl };
export const genUrl = (target: string): string => assetUrl(`gen/${target}`);
