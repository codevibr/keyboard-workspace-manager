import { log, warn } from "./logger.js";
import { focusOrCreateService } from "./tabManager.js";

export async function routeCommand(command, settings) {
  log("Command received", { command });

  const serviceId = settings.commandMap[command];
  if (!serviceId) {
    warn("No service is mapped for command", { command });
    return;
  }

  const service = settings.services[serviceId];
  if (!service) {
    warn("Mapped service was not found", { command, serviceId });
    return;
  }

  if (!service.enabled || !service.url) {
    warn("Shortcut slot is disabled or missing a URL", { command, serviceId });
    return;
  }

  await focusOrCreateService(service, settings);
}
