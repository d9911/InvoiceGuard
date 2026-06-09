import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import * as dotenv from 'dotenv'
import { InvoiceModel } from '@/entities/invoice/model'
import { UserModel } from '@/entities/user/model'
import { MerchantModel } from '@/entities/merchant/model'
import { connectDB } from '@/infrastructure/db/mongoose'


dotenv.config()

async function seed() {
  try {
    await connectDB()

    console.log('🧹 Очистка старых данных...')

    await Promise.all([MerchantModel.deleteMany({}), UserModel.deleteMany({})])

    console.log('👤 Создание пользователей...')
    const passwordHashAdmin = await bcrypt.hash('d9911', 10)
    const passwordHashUser = await bcrypt.hash('admin', 10)

    // Создаем двух пользователей с заполненными новыми полями и 2FA
    const users = await UserModel.insertMany([
      {
        email: 'admin@d9911.org',
        username: 'admin_root',
        nickname: 'Super Admin',
        passwordHash: passwordHashAdmin,
        isTwoFactorEnabled: true,
        twoFactorSecret: 'IBOVCYKEJI5VGVCBHJBHC5CUPUTCKQJ4J5BXIRLOKFOSMIK3O5MA',
        lastLoginAt: new Date(),
      },
      {
        email: 'admin@example.com',
        username: 'finance_manager',
        nickname: 'Manager One',
        passwordHash: passwordHashUser,
        isTwoFactorEnabled: false,
      },
    ])

    console.log('🏪 Создание мерчантов и привязка к пользователям...')
    const merchants = await MerchantModel.insertMany([
      {
        merchantId: 'merchant_admin_100',
        name: 'Главная касса (Admin)',
        feePercent: 2.5,
        webhookSecret: 'secret_live_admin_84920',
        ownerId: users[0]._id,
      },
      {
        merchantId: 'merchant_manager_200',
        name: 'Касса филиала (Manager)',
        feePercent: 3.0,
        webhookSecret: 'secret_test_manager_1122',
        ownerId: users[1]._id,
      },
    ])
    // НОВЫЙ БЛОК: Создание инвойсов
    console.log('🧾 Создание тестовых транзакций (Invoices)...')

    // Сначала очистим старые (нужно добавить в Promise.all в начале файла)
    await InvoiceModel.deleteMany({})

    await InvoiceModel.insertMany([
      {
        invoiceId: 'inv_A001',
        merchantId: merchants[0].merchantId, // string merchantId
        amount: 1000,
        currency: 'USD',
        fee: 25, // 2.5% commission
        amountToReceive: 975,
        status: 'paid',
      },
      {
        invoiceId: 'inv_A002',
        merchantId: merchants[0].merchantId,
        amount: 500,
        currency: 'USD',
        fee: 12.5,
        amountToReceive: 487.5,
        status: 'pending',
      },
      {
        invoiceId: 'inv_B001',
        merchantId: merchants[1].merchantId, // string merchantId
        amount: 2000,
        currency: 'EUR',
        fee: 60, // 3.0% commission
        amountToReceive: 1940,
        status: 'failed',
      },
    ])
    console.log('✅ Seed успешно выполнен!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Ошибка при выполнении Seed:', error)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

seed()
