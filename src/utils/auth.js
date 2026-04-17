import { jwtDecode } from "jwt-decode";

export const ROLE_PATHS = {
  ROLE_USER: "/home",
  ROLE_ADMIN: "/admin",
  ROLE_SUPPLIER: "/supplier"
};

export function normalizeRole(role) {
  if (typeof role !== "string") {
    return "";
  }

  const normalized = role.trim().toUpperCase();

  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("ROLE_")) {
    return normalized;
  }

  if (normalized === "USER" || normalized === "ADMIN" || normalized === "SUPPLIER") {
    return `ROLE_${normalized}`;
  }

  return normalized;
}

export function getRedirectPathForRole(role) {
  return ROLE_PATHS[normalizeRole(role)] || "";
}

function extractRoleFromObject(source) {
  if (!source || typeof source !== "object") {
    return "";
  }

  const directCandidates = [
    source.role,
    source.userRole,
    source.authority,
    source.type
  ];

  for (const candidate of directCandidates) {
    const normalized = normalizeRole(candidate);
    if (normalized.startsWith("ROLE_")) {
      return normalized;
    }
  }

  const authorities = source.authorities;
  if (Array.isArray(authorities) && authorities.length > 0) {
    for (const item of authorities) {
      const value = typeof item === "string" ? item : item?.authority;
      const normalized = normalizeRole(value);
      if (normalized.startsWith("ROLE_")) {
        return normalized;
      }
    }
  }

  const roles = source.roles;
  if (Array.isArray(roles) && roles.length > 0) {
    for (const item of roles) {
      const normalized = normalizeRole(item);
      if (normalized.startsWith("ROLE_")) {
        return normalized;
      }
    }
  }

  if (typeof source.scope === "string") {
    const scopeRole = source.scope
      .split(/\s+/)
      .map((item) => normalizeRole(item))
      .find((item) => item.startsWith("ROLE_"));

    if (scopeRole) {
      return scopeRole;
    }
  }

  if (typeof source.scp === "string") {
    const scpRole = source.scp
      .split(/\s+/)
      .map((item) => normalizeRole(item))
      .find((item) => item.startsWith("ROLE_"));

    if (scpRole) {
      return scpRole;
    }
  }

  const realmAccessRoles = source?.realm_access?.roles;
  if (Array.isArray(realmAccessRoles)) {
    for (const item of realmAccessRoles) {
      const normalized = normalizeRole(item);
      if (normalized.startsWith("ROLE_")) {
        return normalized;
      }
    }
  }

  const resourceAccess = source?.resource_access;
  if (resourceAccess && typeof resourceAccess === "object") {
    for (const value of Object.values(resourceAccess)) {
      const nestedRoles = value?.roles;
      if (Array.isArray(nestedRoles)) {
        for (const item of nestedRoles) {
          const normalized = normalizeRole(item);
          if (normalized.startsWith("ROLE_")) {
            return normalized;
          }
        }
      }
    }
  }

  const nestedCandidates = [source.data, source.user, source.result, source.payload];
  for (const nested of nestedCandidates) {
    const nestedRole = extractRoleFromObject(nested);
    if (nestedRole) {
      return nestedRole;
    }
  }

  return "";
}

export function getRoleFromToken(token) {
  if (!token) {
    return "";
  }

  try {
    const decoded = jwtDecode(token);
    return extractRoleFromObject(decoded);
  } catch {
    return "";
  }
}

export function resolveAuthData(data) {
  let normalizedData = data;

  if (typeof data === "string") {
    const trimmed = data.trim();

    if ((trimmed.startsWith("{") && trimmed.endsWith("}")) || (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
      try {
        normalizedData = JSON.parse(trimmed);
      } catch {
        normalizedData = trimmed;
      }
    } else {
      normalizedData = trimmed.replace(/^"|"$/g, "");
    }
  }

  const token = typeof normalizedData === "string"
    ? normalizedData.replace(/^Bearer\s+/i, "").trim()
    : normalizedData?.token || normalizedData?.accessToken || normalizedData?.jwt || normalizedData?.data?.token || "";

  const roleFromResponse = extractRoleFromObject(normalizedData);

  const roleFromToken = token ? getRoleFromToken(token) : "";

  return {
    token,
    role: roleFromResponse || roleFromToken
  };
}

export function getStoredRole(token = localStorage.getItem("token")) {
  const storedRole = normalizeRole(localStorage.getItem("role"));
  if (storedRole) {
    return storedRole;
  }

  const roleFromToken = getRoleFromToken(token);
  if (roleFromToken) {
    localStorage.setItem("role", roleFromToken);
  }

  return roleFromToken;
}