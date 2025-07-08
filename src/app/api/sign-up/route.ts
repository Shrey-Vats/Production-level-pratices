import dbConnect from "@/lib/dbConnect";
import UserModel from "@/models/user";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { ApiResponse } from "@/types/ApiResponse";

export async function POST(request: Request): Promise<NextResponse<ApiResponse>>{
  await dbConnect();

  try {
    const { username, email, password } = await request.json()

    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });

    if(existingUserVerifiedByUsername){
        return NextResponse.json({
            success: false,
            message: "Username is already taken"
        }, { status: 400 })
    }

    const existingUserByEmail = await UserModel.findOne({ email });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if(existingUserByEmail){
        if (existingUserByEmail.isVerified){
            return NextResponse.json({
                success: false,
                message: "User is already registered"
            }, {status: 400})
        } else{
            const hashedPassword = await bcrypt.hash(password, 10)
            
            existingUserByEmail.password = hashedPassword
            existingUserByEmail.verifyCode = verifyCode
            existingUserByEmail.verifyCodeExpire = new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 hr

            await existingUserByEmail.save()
        }
    } else{
        const hashedPassword = await bcrypt.hash(password, 10)
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getHours() + 6) // 6 hr

        const newUser = new UserModel({
          username,
          email,
          password: hashedPassword,
          verifyCode,
          verifyCodeExpire: expiryDate,
          isVerified: false,
          isAcceptingMessage: true,
          messages: [],
        });

        await newUser.save()
    }

    // send verification email
    const emailResponse = await sendVerificationEmail(email, username, verifyCode)

    if(!emailResponse.success){
        return NextResponse.json({
            success: false,
            message: emailResponse.message
        }, {status: 500})
    }

    return NextResponse.json({
        success: true,
        message: "User register successfuly, Plz verify your email"
    }, {status: 201})

  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error registering user",
      },
      { status: 500 }
    );
  }
}