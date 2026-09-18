import { api, ADMIN, registerCustomer, decodeJwt } from './helpers'

// feature.md A1 (Register) + B2/B3 (status code และ JWT payload)
describe('POST /api/auth/register', () => {
  it('สมัครสมาชิกใหม่ได้ 201 พร้อม token และ role customer', async () => {
    const email = `new_${Date.now()}@example.com`

    const res = await api()
      .post('/api/auth/register')
      .send({ firstname: 'New', lastname: 'Student', email, password: '123456' })

    expect(res.status).toBe(201)
    expect(res.body.status).toBe('ok')
    expect(res.body.token).toBeTruthy()
    expect(res.body.user.email).toBe(email)

    // สมัครเองแล้วเป็น admin ไม่ได้ ต้องเป็น customer เสมอ
    expect(res.body.user.role).toBe('customer')
  })

  it('สมัครด้วย email ซ้ำได้ 409 ไม่ใช่ 200', async () => {
    const { email } = await registerCustomer()

    const res = await api()
      .post('/api/auth/register')
      .send({ firstname: 'Dup', lastname: 'User', email, password: '123456' })

    expect(res.status).toBe(409)
    expect(res.body.message).toBe('Email already exists')
  })
})

describe('POST /api/auth/login', () => {
  it('login สำเร็จได้ 200 และบอก role มาด้วย', async () => {
    const res = await api().post('/api/auth/login').send(ADMIN)

    expect(res.status).toBe(200)
    expect(res.body.user.role).toBe('admin')
    expect(res.body.token).toBeTruthy()
  })

  it('รหัสผ่านผิดได้ 401', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ email: ADMIN.email, password: 'wrong-password' })

    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
  })

  it('email ที่ไม่มีในระบบได้ 401', async () => {
    const res = await api()
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: '123456' })

    expect(res.status).toBe(401)
  })
})

// feature.md A2/B1/B2: payload ต้องมี id (Order API ใช้), role (requireAdmin ใช้)
// และ exp (Auto Logout ใช้)
describe('JWT payload', () => {
  it('มี id, email, role และวันหมดอายุครบ', async () => {
    const { token, id, email } = await registerCustomer()
    const payload = decodeJwt(token)

    expect(payload.id).toBe(id)
    expect(payload.email).toBe(email)
    expect(payload.role).toBe('customer')
    expect(typeof payload.exp).toBe('number')
    expect(payload.exp as number).toBeGreaterThan(payload.iat as number)
  })
})
