"use server"

import { signIn } from "@/auth"
import { prisma } from "@/lib/prisma"
import { hash } from "bcryptjs"
import { AuthError } from "next-auth"
import { z } from "zod"

const registerSchema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(6),
})

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export async function registerAction(values: z.infer<typeof registerSchema>) {
    const validatedFields = registerSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields" }
    }

    const { email, password, name } = validatedFields.data

    const existingUser = await prisma.user.findUnique({
        where: { email },
    })

    if (existingUser) {
        return { error: "Email already in use" }
    }

    const hashedPassword = await hash(password, 10)

    await prisma.user.create({
        data: {
            name,
            email,
            passwordHash: hashedPassword,
            role: "STUDENT", // Default role
        },
    })

    return { success: "User created" }
}

export async function loginAction(values: z.infer<typeof loginSchema>) {
    const validatedFields = loginSchema.safeParse(values)

    if (!validatedFields.success) {
        return { error: "Invalid fields" }
    }

    const { email, password } = validatedFields.data

    try {
        await signIn("credentials", {
            email,
            password,
            redirect: false,
        })
        return { success: "Logged in" }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid credentials" }
                default:
                    return { error: "Something went wrong" }
            }
        }
        throw error
    }
}
