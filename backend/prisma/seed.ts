import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcryptjs from "bcryptjs";

const adapter = new PrismaBetterSqlite3({
  url: "file:./dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data (skip errors if tables don't exist)
  try {
    await prisma.borrowTicket.deleteMany();
    await prisma.book.deleteMany();
    await prisma.reader.deleteMany();
    await prisma.user.deleteMany();
    console.log("✅ Existing data cleared");
  } catch (error) {
    console.log("ℹ️ Tables not found or already empty, creating fresh data...");
  }

  // Create users
  const adminPassword = await bcryptjs.hash("123456", 10);
  const admin2Password = await bcryptjs.hash("admin123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "thuthu@quanlysach.com",
      password: adminPassword,
      role: "ADMIN",
      name: "Admin",
    },
  });

  const admin2 = await prisma.user.create({
    data: {
      email: "admin@quanlysach.com",
      password: admin2Password,
      role: "ADMIN",
      name: "Admin",
    },
  });

  console.log("✅ Users created:", { admin: admin.email, admin2: admin2.email });

  // Create books
  const books = await Promise.all([
    prisma.book.create({
      data: {
        code: "S00000000001",
        title: "Lập trình TypeScript",
        author: "Nguyễn Minh Tuấn",
        totalQuantity: 5,
        availableQty: 5,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000002",
        title: "Cấu trúc dữ liệu và giải thuật",
        author: "Trần Quốc Bảo",
        totalQuantity: 8,
        availableQty: 7,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000003",
        title: "Nhập môn Machine Learning",
        author: "Lê Hoàng Nam",
        totalQuantity: 4,
        availableQty: 4,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000004",
        title: "Thiết kế hệ thống phần mềm",
        author: "Phạm Văn Hòa",
        totalQuantity: 3,
        availableQty: 2,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000005",
        title: "Lập trình Web với React",
        author: "Võ Thị Lan",
        totalQuantity: 6,
        availableQty: 6,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000006",
        title: "Cơ sở dữ liệu nâng cao",
        author: "Nguyễn Đức Thành",
        totalQuantity: 4,
        availableQty: 4,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000007",
        title: "Mạng máy tính",
        author: "Trần Văn Hùng",
        totalQuantity: 5,
        availableQty: 3,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000008",
        title: "Trí tuệ nhân tạo",
        author: "Lê Minh Đức",
        totalQuantity: 3,
        availableQty: 3,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000009",
        title: "Hệ điều hành Linux",
        author: "Phạm Quốc Việt",
        totalQuantity: 2,
        availableQty: 1,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000010",
        title: "Python cho Data Science",
        author: "Hoàng Thị Mai",
        totalQuantity: 7,
        availableQty: 6,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000011",
        title: "Cloud Computing với AWS",
        author: "Đỗ Văn Kiên",
        totalQuantity: 3,
        availableQty: 3,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000012",
        title: "Bảo mật thông tin",
        author: "Cao Thị Linh",
        totalQuantity: 4,
        availableQty: 4,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000013",
        title: "DevOps và CI/CD",
        author: "Nguyễn Anh Tú",
        totalQuantity: 2,
        availableQty: 2,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000014",
        title: "Microservices Architecture",
        author: "Trương Văn Sơn",
        totalQuantity: 3,
        availableQty: 3,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000015",
        title: "Node.js và Express",
        author: "Vũ Thị Phương",
        totalQuantity: 5,
        availableQty: 5,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000016",
        title: "Testing and QA",
        author: "Lý Quốc Hùng",
        totalQuantity: 3,
        availableQty: 3,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000017",
        title: "Agile và Scrum",
        author: "Đặng Thị Hương",
        totalQuantity: 4,
        availableQty: 4,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000018",
        title: "GraphQL Essentials",
        author: "Bùi Văn Tài",
        totalQuantity: 2,
        availableQty: 2,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000019",
        title: "Docker và Kubernetes",
        author: "Phan Thị Thanh",
        totalQuantity: 3,
        availableQty: 3,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000020",
        title: "Angular Framework",
        author: "Hoàng Minh Hải",
        totalQuantity: 4,
        availableQty: 4,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000021",
        title: "Vue.js Tutorials",
        author: "Ngô Thị Hoa",
        totalQuantity: 3,
        availableQty: 3,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000022",
        title: "Golang Programming",
        author: "Trần Đình Long",
        totalQuantity: 2,
        availableQty: 2,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000023",
        title: "Rust Systems",
        author: "Vũ Hải Đăng",
        totalQuantity: 2,
        availableQty: 2,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000024",
        title: "Mobile Development",
        author: "Dương Thị Yến",
        totalQuantity: 4,
        availableQty: 4,
      },
    }),
    prisma.book.create({
      data: {
        code: "S00000000025",
        title: "Blockchain Technology",
        author: "Lương Văn Tuấn",
        totalQuantity: 3,
        availableQty: 3,
      },
    }),
  ]);

  console.log(`✅ ${books.length} books created`);

  // Create readers
  const readers = await Promise.all([
    prisma.reader.create({
      data: {
        code: "DG0000000001",
        name: "Nguyễn Văn An",
        email: "an@email.com",
        phone: "0901000001",
        membershipExpiry: new Date("2027-12-31"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000002",
        name: "Trần Thị Bình",
        email: "binh@email.com",
        phone: "0901000002",
        membershipExpiry: new Date("2027-06-30"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000003",
        name: "Lê Văn Cường",
        email: "cuong@email.com",
        phone: "0901000003",
        membershipExpiry: new Date("2026-03-15"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000004",
        name: "Phạm Thị Dung",
        email: "dung@email.com",
        phone: "0901000004",
        membershipExpiry: new Date("2025-01-01"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000005",
        name: "Hoàng Văn Em",
        email: "em@email.com",
        phone: "0901000005",
        membershipExpiry: new Date("2027-09-30"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000006",
        name: "Võ Thị Phương",
        email: "phuong@email.com",
        phone: "0901000006",
        membershipExpiry: new Date("2027-08-15"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000007",
        name: "Đặng Văn Giang",
        email: "giang@email.com",
        phone: "0901000007",
        membershipExpiry: new Date("2027-11-20"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000008",
        name: "Bùi Thị Hạnh",
        email: "hanh@email.com",
        phone: "0901000008",
        membershipExpiry: new Date("2026-07-01"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000009",
        name: "Ngô Văn Ích",
        email: "ich@email.com",
        phone: "0901000009",
        membershipExpiry: new Date("2027-04-10"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000010",
        name: "Đỗ Thị Kim",
        email: "kim@email.com",
        phone: "0901000010",
        membershipExpiry: new Date("2027-02-28"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000011",
        name: "Lý Anh Quân",
        email: "quan@email.com",
        phone: "0901000011",
        membershipExpiry: new Date("2027-03-15"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000012",
        name: "Trương Thị Linh",
        email: "linh@email.com",
        phone: "0901000012",
        membershipExpiry: new Date("2026-12-31"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000013",
        name: "Hồ Văn Minh",
        email: "minh@email.com",
        phone: "0901000013",
        membershipExpiry: new Date("2027-05-20"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000014",
        name: "Cao Thị Nhung",
        email: "nhung@email.com",
        phone: "0901000014",
        membershipExpiry: new Date("2027-07-10"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000015",
        name: "Xuân Văn Oalong",
        email: "oalong@email.com",
        phone: "0901000015",
        membershipExpiry: new Date("2027-01-31"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000016",
        name: "Phan Thị Phúc",
        email: "phuc@email.com",
        phone: "0901000016",
        membershipExpiry: new Date("2026-10-15"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000017",
        name: "Quách Văn Quân",
        email: "quan2@email.com",
        phone: "0901000017",
        membershipExpiry: new Date("2027-09-05"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000018",
        name: "Rương Thị Rin",
        email: "rin@email.com",
        phone: "0901000018",
        membershipExpiry: new Date("2027-06-20"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000019",
        name: "Sầu Văn Sanh",
        email: "sanh@email.com",
        phone: "0901000019",
        membershipExpiry: new Date("2026-11-30"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000020",
        name: "Tạ Thị Tâm",
        email: "tam@email.com",
        phone: "0901000020",
        membershipExpiry: new Date("2027-04-25"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000021",
        name: "Ứng Văn Uyên",
        email: "uyen@email.com",
        phone: "0901000021",
        membershipExpiry: new Date("2027-08-10"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000022",
        name: "Vương Thị Vân",
        email: "van@email.com",
        phone: "0901000022",
        membershipExpiry: new Date("2026-09-30"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000023",
        name: "Trần Văn Hùng",
        email: "hung@email.com",
        phone: "0901000023",
        membershipExpiry: new Date("2027-10-15"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000024",
        name: "Đinh Thị Hạnh",
        email: "hanh2@email.com",
        phone: "0901000024",
        membershipExpiry: new Date("2027-05-20"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000025",
        name: "Nguyễn Minh Tuấn",
        email: "tuan@email.com",
        phone: "0901000025",
        membershipExpiry: new Date("2026-08-30"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000026",
        name: "Lý Thị Hương",
        email: "huong@email.com",
        phone: "0901000026",
        membershipExpiry: new Date("2027-07-15"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000027",
        name: "Phạm Văn Sơn",
        email: "son@email.com",
        phone: "0901000027",
        membershipExpiry: new Date("2027-09-10"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000028",
        name: "Võ Thị Thu",
        email: "thu@email.com",
        phone: "0901000028",
        membershipExpiry: new Date("2026-12-25"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000029",
        name: "Hoàng Văn Kiên",
        email: "kien@email.com",
        phone: "0901000029",
        membershipExpiry: new Date("2027-11-30"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000030",
        name: "Bùi Thị Lan",
        email: "lan@email.com",
        phone: "0901000030",
        membershipExpiry: new Date("2027-03-05"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000031",
        name: "Ngô Văn Linh",
        email: "linh2@email.com",
        phone: "0901000031",
        membershipExpiry: new Date("2026-06-20"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000032",
        name: "Đỗ Thị Thanh",
        email: "thanh@email.com",
        phone: "0901000032",
        membershipExpiry: new Date("2027-02-14"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000033",
        name: "Lương Văn Đức",
        email: "duc@email.com",
        phone: "0901000033",
        membershipExpiry: new Date("2027-08-22"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000034",
        name: "Trương Thị Hoa",
        email: "hoa@email.com",
        phone: "0901000034",
        membershipExpiry: new Date("2026-11-11"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000035",
        name: "Hồ Văn Tâm",
        email: "tam2@email.com",
        phone: "0901000035",
        membershipExpiry: new Date("2027-12-01"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000036",
        name: "Cao Thị Hiền",
        email: "hien@email.com",
        phone: "0901000036",
        membershipExpiry: new Date("2026-10-30"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000037",
        name: "Xuân Văn Long",
        email: "long@email.com",
        phone: "0901000037",
        membershipExpiry: new Date("2027-04-18"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000038",
        name: "Phan Thị Hương",
        email: "huong2@email.com",
        phone: "0901000038",
        membershipExpiry: new Date("2027-06-09"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000039",
        name: "Quách Văn Huy",
        email: "huy@email.com",
        phone: "0901000039",
        membershipExpiry: new Date("2027-09-27"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000040",
        name: "Rương Thị Liên",
        email: "lien@email.com",
        phone: "0901000040",
        membershipExpiry: new Date("2026-07-12"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000041",
        name: "Sầu Văn Nam",
        email: "nam@email.com",
        phone: "0901000041",
        membershipExpiry: new Date("2027-01-25"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000042",
        name: "Tạ Thị Yến",
        email: "yen@email.com",
        phone: "0901000042",
        membershipExpiry: new Date("2027-05-08"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000043",
        name: "Ứng Văn Khoa",
        email: "khoa@email.com",
        phone: "0901000043",
        membershipExpiry: new Date("2027-10-31"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000044",
        name: "Vũ Thị Mai",
        email: "mai@email.com",
        phone: "0901000044",
        membershipExpiry: new Date("2026-09-16"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000045",
        name: "Gia Văn Hùng",
        email: "hung2@email.com",
        phone: "0901000045",
        membershipExpiry: new Date("2027-08-05"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000046",
        name: "Kiều Thị Nga",
        email: "nga@email.com",
        phone: "0901000046",
        membershipExpiry: new Date("2027-11-12"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000047",
        name: "Lâm Văn Tuấn",
        email: "tuan2@email.com",
        phone: "0901000047",
        membershipExpiry: new Date("2026-04-28"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000048",
        name: "Mã Thị Hằng",
        email: "hang@email.com",
        phone: "0901000048",
        membershipExpiry: new Date("2027-03-19"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000049",
        name: "Nai Văn Minh",
        email: "minh2@email.com",
        phone: "0901000049",
        membershipExpiry: new Date("2027-07-24"),
      },
    }),
    prisma.reader.create({
      data: {
        code: "DG0000000050",
        name: "Ốc Thị Trang",
        email: "trang@email.com",
        phone: "0901000050",
        membershipExpiry: new Date("2026-12-08"),
      },
    }),
  ]);

  console.log(`✅ ${readers.length} readers created`);

  // Create sample borrow tickets for testing
  const today = new Date();
  const tickets = await Promise.all([
    // Active borrowing - reader[0]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000001",
        readerId: readers[0].id,
        bookId: books[0].id,
        borrowedAt: new Date(today.getTime() - 8 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000),
        status: "BORROWING",
      },
    }),
    // Due soon - reader[0]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000011",
        readerId: readers[0].id,
        bookId: books[2].id,
        borrowedAt: new Date(today.getTime() - 18 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: "BORROWING",
      },
    }),
    // Returned - reader[0]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000012",
        readerId: readers[0].id,
        bookId: books[1].id,
        borrowedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() - 23 * 24 * 60 * 60 * 1000),
        returnedAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
        status: "RETURNED",
      },
    }),
    // Active borrowing - reader[1]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000002",
        readerId: readers[1].id,
        bookId: books[3].id,
        borrowedAt: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
        status: "BORROWING",
      },
    }),
    // Overdue - reader[1]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000003",
        readerId: readers[1].id,
        bookId: books[1].id,
        borrowedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        status: "BORROWING",
      },
    }),
    // Active borrowing - reader[2]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000004",
        readerId: readers[2].id,
        bookId: books[4].id,
        borrowedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: "BORROWING",
      },
    }),
    // Long overdue - reader[3]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000005",
        readerId: readers[3].id,
        bookId: books[6].id,
        borrowedAt: new Date(today.getTime() - 25 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() - 10 * 24 * 60 * 60 * 1000),
        status: "BORROWING",
      },
    }),
    // Due soon - reader[4]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000006",
        readerId: readers[4].id,
        bookId: books[7].id,
        borrowedAt: new Date(today.getTime() - 18 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000),
        status: "BORROWING",
      },
    }),
    // Returned - reader[0]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000007",
        readerId: readers[0].id,
        bookId: books[5].id,
        borrowedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() - 23 * 24 * 60 * 60 * 1000),
        returnedAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000),
        status: "RETURNED",
      },
    }),
    // Returned on time - reader[1]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000008",
        readerId: readers[1].id,
        bookId: books[8].id,
        borrowedAt: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() - 38 * 24 * 60 * 60 * 1000),
        returnedAt: new Date(today.getTime() - 38 * 24 * 60 * 60 * 1000),
        status: "RETURNED",
      },
    }),
    // Lost book - reader[2]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000009",
        readerId: readers[2].id,
        bookId: books[9].id,
        borrowedAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() - 53 * 24 * 60 * 60 * 1000),
        isLost: true,
        status: "LOST",
      },
    }),
    // Returned late - reader[3]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000010",
        readerId: readers[3].id,
        bookId: books[10].id,
        borrowedAt: new Date(today.getTime() - 75 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() - 68 * 24 * 60 * 60 * 1000),
        returnedAt: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000),
        status: "RETURNED",
      },
    }),
    // Recently borrowed - reader[4]
    prisma.borrowTicket.create({
      data: {
        ticketCode: "PM0000000099",
        readerId: readers[4].id,
        bookId: books[11].id,
        borrowedAt: new Date(today.getTime() - 1 * 24 * 60 * 60 * 1000),
        dueDate: new Date(today.getTime() + 13 * 24 * 60 * 60 * 1000),
        status: "BORROWING",
      },
    }),
  ]);

  console.log(`✅ ${tickets.length} borrow tickets created`);

  // Update book quantities based on active tickets
  const activeTickets = tickets.filter((t: any) => t.status === "BORROWING").length;
  console.log(`✅ Database seeded successfully! (${activeTickets} active tickets)`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("✅ Seeding complete!");
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
