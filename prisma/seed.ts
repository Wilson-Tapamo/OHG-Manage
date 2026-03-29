
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding...')

    // 1. Clean Database
    console.log('Cleaning database...')
    await prisma.notification.deleteMany()
    await prisma.financeEntry.deleteMany()
    await prisma.taskHours.deleteMany()
    await prisma.comment.deleteMany()
    await prisma.subTask.deleteMany()
    await prisma.invoiceLine.deleteMany()
    await prisma.invoice.deleteMany()
    await prisma.task.deleteMany()
    await prisma.project.deleteMany()
    await prisma.user.deleteMany()

    // 2. Create Users
    const password = await bcrypt.hash('password123', 10)

    // User 1: Patrice Etoundi Ottou (Director)
    const director = await prisma.user.create({
        data: {
            email: 'p.etoundi@optimum.com',
            name: 'Patrice Etoundi Ottou',
            password,
            role: 'DIRECTOR',
            title: 'Associé Gérant',
            description: "Certifié de l'AMF",
            avatar: '/avatars/patrice.jpg', // Placeholder
        }
    })
    console.log(`Created user: ${director.name}`)

    // User 2: Pr Kala Jean Robert (Senior Consultant)
    const kala = await prisma.user.create({
        data: {
            email: 'j.kala@optimum.com',
            name: 'Pr Kala Jean Robert',
            password,
            role: 'CONSULTANT',
            title: 'Professeur en Informatique',
            level: 'SENIOR',
            avatar: '/avatars/kala.jpg', // Placeholder
        }
    })
    console.log(`Created user: ${kala.name}`)

    // User 3: Tapamo Wilson (Fullstack Dev)
    const tapamo = await prisma.user.create({
        data: {
            email: 'w.tapamo@optimum.com',
            name: 'Tapamo Wilson',
            password,
            role: 'CONSULTANT',
            title: 'Développeur Web Fullstack',
            level: 'INTERMEDIATE', // 4 years experience
            avatar: '/avatars/wilson.jpg', // Placeholder
            education: [
                {
                    degree: 'Master',
                    school: 'Université de Yaoundé I',
                    year: '2021' // Approximate based on 4 years exp? Or earlier. Leaving specific year out or estimating.
                },
                {
                    degree: 'Licence',
                    school: 'Université de Yaoundé I',
                    year: '2019'
                }
            ],
            experience: [
                {
                    title: 'Développeur Web Fullstack',
                    company: 'Optimum Juridis Finance',
                    duration: '4 ans',
                    description: 'Développement et maintenance des applications web.'
                }
            ]
        }
    })
    console.log(`Created user: ${tapamo.name}`)

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
