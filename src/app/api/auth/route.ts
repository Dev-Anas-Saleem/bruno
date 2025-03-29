import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db/mongodb';
import User from '@/lib/models/User';

export async function POST(req: Request) {
  try {
    await connectDB();
    const { action, ...data } = await req.json();
    console.log('Action:', action, 'Data:', data);

    switch (action) {
      case 'login': {
        const user = await User.findOne({ username: data.username });
        if (!user || !(await bcrypt.compare(data.password, user.password))) {
          return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }
        user.isConnected = true;
        user.lastLogin = new Date();
        await user.save();
        const { password, ...userWithoutPassword } = user.toObject();
        return NextResponse.json({ user: userWithoutPassword });
      }
      case 'register': {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = await User.create({
          ...data,
          password: hashedPassword,
          isConnected: false
        });
        const { password, ...userWithoutPassword } = newUser.toObject();
        return NextResponse.json({ user: userWithoutPassword });
      }
      case 'logout': {
        await User.findByIdAndUpdate(data.userId, { isConnected: false });
        return NextResponse.json({ success: true });
      }
      case 'delete': {
        await User.findByIdAndDelete(data.userId);
        return NextResponse.json({ success: true });
      }
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in POST /api/auth:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET endpoint to fetch all users without the password field.
export async function GET() {
  try {
    await connectDB();
    const users = await User.find({}, { password: 0 });
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error in GET /api/auth:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
