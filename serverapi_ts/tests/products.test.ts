import { api, registerCustomer, loginAdmin, firstProduct } from './helpers'

// feature.md B1 (Authorization) + B3 (status code และรูปร่าง response)
describe('การเข้าถึง /api/products', () => {
  it('ไม่มี token ได้ 401', async () => {
    const res = await api().get('/api/products')

    expect(res.status).toBe(401)
    expect(res.body.status).toBe('error')
  })

  it('token ปลอมได้ 403 ไม่ใช่ 401', async () => {
    // 401 = ยังพิสูจน์ตัวตนไม่ได้ / 403 = ตรวจแล้วแต่ไม่ผ่าน — คนละความหมาย
    const res = await api().get('/api/products').set('Authorization', 'Bearer not.a.real.token')

    expect(res.status).toBe(403)
  })
})

describe('GET /api/products', () => {
  it('คืน Array ของสินค้าที่ seed ไว้', async () => {
    const { token } = await registerCustomer()

    const res = await api().get('/api/products').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.length).toBeGreaterThan(0)
  })
})

describe('GET /api/products/:id', () => {
  it('คืน Object เดี่ยว ไม่ใช่ Array (feature.md G7)', async () => {
    const { token } = await registerCustomer()
    const product = await firstProduct(token)

    const res = await api()
      .get(`/api/products/${product.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(Array.isArray(res.body)).toBe(false)
    expect(res.body.name).toBe(product.name)
  })

  it('สินค้าที่ไม่มีอยู่ได้ 404', async () => {
    const { token } = await registerCustomer()

    const res = await api().get('/api/products/999999').set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})

// บทเรียนสำคัญที่สุดของ B1: การซ่อนปุ่มใน UI ไม่ใช่ security
// test ชุดนี้คือสิ่งที่ widget test ฝั่ง Flutter พิสูจน์ไม่ได้
describe('customer เขียนข้อมูลไม่ได้', () => {
  it('POST /api/products ได้ 403', async () => {
    const { token } = await registerCustomer()

    const res = await api()
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Hacked Coffee')
      .field('barcode', 'HACK001')
      .field('stock', '10')
      .field('price', '1')
      .field('category_id', '1')
      .field('status_id', '1')

    expect(res.status).toBe(403)
  })

  it('PUT /api/products/:id ได้ 403', async () => {
    const { token } = await registerCustomer()
    const product = await firstProduct(token)

    const res = await api()
      .put(`/api/products/${product.id}`)
      .set('Authorization', `Bearer ${token}`)
      .field('price', '1')

    expect(res.status).toBe(403)
  })

  it('DELETE /api/products/:id ได้ 403 และสินค้ายังอยู่', async () => {
    const { token } = await registerCustomer()
    const product = await firstProduct(token)

    const res = await api()
      .delete(`/api/products/${product.id}`)
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)

    const check = await api()
      .get(`/api/products/${product.id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(check.status).toBe(200)
  })
})

describe('admin เขียนข้อมูลได้', () => {
  it('สร้างสินค้าใหม่ได้ 201 แล้วลบได้ 200', async () => {
    const token = await loginAdmin()

    const created = await api()
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .field('name', 'Test Espresso')
      .field('description', 'สร้างจาก automated test')
      .field('barcode', `TEST${Date.now()}`)
      .field('stock', '5')
      .field('price', '55')
      .field('category_id', '1')
      .field('status_id', '1')

    expect(created.status).toBe(201)
    expect(created.body.product.name).toBe('Test Espresso')

    const id = created.body.product.id

    const removed = await api()
      .delete(`/api/products/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(removed.status).toBe(200)

    const gone = await api()
      .get(`/api/products/${id}`)
      .set('Authorization', `Bearer ${token}`)
    expect(gone.status).toBe(404)
  })

  it('ลบสินค้าที่ไม่มีอยู่ได้ 404 ไม่ใช่ 200', async () => {
    const token = await loginAdmin()

    const res = await api()
      .delete('/api/products/999999')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(404)
  })
})
