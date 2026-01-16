import { prisma } from './index'

async function testConnection() {
  try {
    console.log('Testing database connection...')
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Successfully connected to database!')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query test passed:', result)
    
    // Check if we can query the User table (even if empty)
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ User table accessible. Current user count: ${userCount}`)
    } catch (error: any) {
      if (error?.code === 'P2021') {
        console.log('⚠️  Database tables do not exist yet. Run migrations with: pnpm db:migrate')
      } else {
        throw error
      }
    }
    
    // Get database info
    const dbInfo = await prisma.$queryRaw<Array<{ current_database: string }>>`
      SELECT current_database()
    `
    console.log('✅ Database name:', dbInfo[0]?.current_database)
    
    console.log('\n🎉 Database connection is working correctly!')
    
  } catch (error) {
    console.error('❌ Database connection failed:')
    console.error(error)
    
    if (error instanceof Error) {
      if (error.message.includes('P1001')) {
        console.error('\n💡 Tip: The database server might not be reachable. Check your DATABASE_URL.')
      } else if (error.message.includes('P1000')) {
        console.error('\n💡 Tip: Authentication failed. Check your database credentials.')
      } else if (error.message.includes('P1017')) {
        console.error('\n💡 Tip: The database server closed the connection. Check if the server is running.')
      }
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
