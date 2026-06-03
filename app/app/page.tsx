import {
  PRIVATE_SHELL_MESSAGE,
  PRIVATE_SHELL_ROUTE,
} from "../../src/lib/privateApp/privateShellPlaceholder";
import { PrivateShellPlaceholder } from "../../src/components/privateApp/PrivateShellPlaceholder";

export default function AppPlaceholder() {
  return (
    <PrivateShellPlaceholder
      currentPath={PRIVATE_SHELL_ROUTE}
      message={PRIVATE_SHELL_MESSAGE}
    />
  );
}
