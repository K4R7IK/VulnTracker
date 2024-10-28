import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  await prisma.company.create({
    data: {
      name: "Test Company",
      testingType: "Internal",
      assets: {
        create: [
          {
            title: "Vuln 1",
            description: "Sample vulnerability",
            ip: "192.168.1.1",
            port: 8080,
            riskLevel: "High",
            impact: "Potential impact",
            recommendations: "Apply patch",
            reference: ["https://example.com/patch"],
          },
        ],
      },
    },
  })
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
