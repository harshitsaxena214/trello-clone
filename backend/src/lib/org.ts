import { prisma } from "./db";
export const resolveOrgSlug = async (slug: string) => {
  return prisma.organization.findUnique({
    where: { slug },
    select: { id: true },
  });
};
