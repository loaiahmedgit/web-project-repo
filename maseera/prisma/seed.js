const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const USERS = [
  { id: 'user_ahmed',   username: 'ahmed_hassan',   displayName: 'أحمد حسن',    email: 'ahmed@maseera.com',   verified: false, avatar: 'أ' },
  { id: 'user_mohamed', username: 'mohamed_ali',    displayName: 'محمد علي',     email: 'mohamed@maseera.com', verified: true,  avatar: 'م' },
  { id: 'user_youssef', username: 'youssef_khaled', displayName: 'يوسف خالد',   email: 'youssef@maseera.com', verified: false, avatar: 'ي' },
  { id: 'user_omar',    username: 'omar_salim',     displayName: 'عمر سليم',     email: 'omar@maseera.com',    verified: false, avatar: 'ع' },
  { id: 'user_lina',    username: 'lina_ahmad',     displayName: 'لينا أحمد',    email: 'lina@maseera.com',    verified: true,  avatar: 'ل' },
  { id: 'user_sara',    username: 'sara_nasser',    displayName: 'سارة ناصر',    email: 'sara@maseera.com',    verified: false, avatar: 'س' },
  { id: 'user_ali',     username: 'ali_mahmoud',    displayName: 'علي محمود',    email: 'ali@maseera.com',     verified: false, avatar: 'ع' },
  { id: 'user_nour',    username: 'nour_hassan',    displayName: 'نور حسن',      email: 'nour@maseera.com',    verified: true,  avatar: 'ن' },
  { id: 'user_reem',    username: 'reem_khalid',    displayName: 'ريم خالد',     email: 'reem@maseera.com',    verified: false, avatar: 'ر' },
  { id: 'user_khaled',  username: 'khaled_ibrahim', displayName: 'خالد إبراهيم', email: 'khaled@maseera.com',  verified: false, avatar: 'خ' },
  { id: 'user_maya',    username: 'maya_salem',     displayName: 'مايا سالم',    email: 'maya@maseera.com',    verified: true,  avatar: 'م' },
  { id: 'user_faris',   username: 'faris_ali',      displayName: 'فارس علي',     email: 'faris@maseera.com',   verified: false, avatar: 'ف' },
];

const POSTS = [
  { id: 'post_1',  authorId: 'user_ahmed',   caption: 'مرحبا رمضان',           hashtags: 'egypt,travel',         mediaType: 'video', mediaPath: '/media/videos/Video_1.mp4', audioPath: '/media/audio/Video_1.mp3', createdAt: new Date('2026-03-18T14:30:00Z') },
  { id: 'post_2',  authorId: 'user_mohamed', caption: 'لحظة مميزة',             hashtags: 'photo',                mediaType: 'image', mediaPath: '/media/images/Post_1.png',  createdAt: new Date('2026-03-18T10:00:00Z') },
  { id: 'post_3',  authorId: 'user_omar',    caption: 'الاسكندرية',              hashtags: 'syria,history',        mediaType: 'video', mediaPath: '/media/videos/Video_2.mp4', audioPath: '/media/audio/Video_2.mp3', createdAt: new Date('2026-03-18T12:00:00Z') },
  { id: 'post_4',  authorId: 'user_youssef', caption: 'يوم رائع في القاهرة',    hashtags: 'cairo,egypt',          mediaType: 'image', mediaPath: '/media/images/Post_2.png',  createdAt: new Date('2026-02-10T08:00:00Z') },
  { id: 'post_5',  authorId: 'user_lina',    caption: 'أجمل الذكريات',           hashtags: 'memories',             mediaType: 'image', mediaPath: '/media/images/Post_3.png',  createdAt: new Date('2026-01-15T16:00:00Z') },
  { id: 'post_6',  authorId: 'user_sara',    caption: 'أول يوم في العمل الجديد', hashtags: 'work,life',           mediaType: 'text',  createdAt: new Date('2026-04-01T09:00:00Z') },
  { id: 'post_7',  authorId: 'user_ahmed',   caption: 'رحلة إلى الأقصر',         hashtags: 'egypt,travel,history', mediaType: 'image', mediaPath: '/media/images/Post_1.png',  createdAt: new Date('2026-04-05T11:00:00Z') },
  { id: 'post_8',  authorId: 'user_nour',    caption: 'كتاب الأسبوع',            hashtags: 'books,reading',        mediaType: 'text',  createdAt: new Date('2026-04-10T20:00:00Z') },
  { id: 'post_9',  authorId: 'user_ali',     caption: 'تمرين الصباح',            hashtags: 'fitness,health',       mediaType: 'video', mediaPath: '/media/videos/run.mp4',     createdAt: new Date('2026-04-12T07:00:00Z') },
  { id: 'post_10', authorId: 'user_ahmed',   caption: 'غروب الشمس على النيل',    hashtags: 'egypt,nature',         mediaType: 'image', mediaPath: '/media/images/Post_2.png',  createdAt: new Date('2026-04-15T18:00:00Z') },
];

const FOLLOWS = [
  { followerId: 'user_ahmed',   followingId: 'user_omar'    },
  { followerId: 'user_ahmed',   followingId: 'user_lina'    },
  { followerId: 'user_sara',    followingId: 'user_ahmed'   },
  { followerId: 'user_ali',     followingId: 'user_lina'    },
  { followerId: 'user_nour',    followingId: 'user_mohamed' },
  { followerId: 'user_reem',    followingId: 'user_ahmed'   },
  { followerId: 'user_khaled',  followingId: 'user_lina'    },
  { followerId: 'user_maya',    followingId: 'user_ahmed'   },
  { followerId: 'user_faris',   followingId: 'user_nour'    },
  { followerId: 'user_youssef', followingId: 'user_sara'    },
  { followerId: 'user_omar',    followingId: 'user_ahmed'   },
  { followerId: 'user_lina',    followingId: 'user_nour'    },
];

const LIKES = [
  { userId: 'user_ahmed',   postId: 'post_2'  },
  { userId: 'user_omar',    postId: 'post_2'  },
  { userId: 'user_lina',    postId: 'post_1'  },
  { userId: 'user_mohamed', postId: 'post_3'  },
  { userId: 'user_sara',    postId: 'post_1'  },
  { userId: 'user_ali',     postId: 'post_5'  },
  { userId: 'user_nour',    postId: 'post_1'  },
  { userId: 'user_reem',    postId: 'post_7'  },
  { userId: 'user_khaled',  postId: 'post_7'  },
  { userId: 'user_maya',    postId: 'post_7'  },
  { userId: 'user_faris',   postId: 'post_10' },
  { userId: 'user_youssef', postId: 'post_10' },
  { userId: 'user_ahmed',   postId: 'post_8'  },
  { userId: 'user_sara',    postId: 'post_8'  },
];

const REPOSTS = [
  { userId: 'user_sara',   postId: 'post_1' },
  { userId: 'user_nour',   postId: 'post_3' },
  { userId: 'user_khaled', postId: 'post_2' },
];

const COMMENTS = [
  { postId: 'post_1',  authorId: 'user_omar',   content: 'رمضان كريم!' },
  { postId: 'post_1',  authorId: 'user_lina',   content: 'ما شاء الله، جميل جداً' },
  { postId: 'post_1',  authorId: 'user_sara',   content: 'الله يتقبل منا ومنكم' },
  { postId: 'post_2',  authorId: 'user_ahmed',  content: 'لحظات لا تُنسى' },
  { postId: 'post_2',  authorId: 'user_nour',   content: 'صورة رائعة!' },
  { postId: 'post_3',  authorId: 'user_sara',   content: 'الاسكندرية دائماً في القلب' },
  { postId: 'post_3',  authorId: 'user_reem',   content: 'أشتاق لها كثيراً' },
  { postId: 'post_7',  authorId: 'user_khaled', content: 'الأقصر من أجمل المدن' },
  { postId: 'post_7',  authorId: 'user_maya',   content: 'يا ريتني معاك!' },
  { postId: 'post_8',  authorId: 'user_ahmed',  content: 'ما هو الكتاب؟' },
  { postId: 'post_10', authorId: 'user_ali',    content: 'منظر خلاب' },
  { postId: 'post_10', authorId: 'user_faris',  content: 'النيل دائماً يُهدئ النفس' },
];

const MESSAGES = [
  { senderId: 'user_ahmed', receiverId: 'user_lina',  content: 'مرحباً لينا، كيف حالك؟' },
  { senderId: 'user_lina',  receiverId: 'user_ahmed', content: 'أهلاً أحمد! بخير الحمد لله' },
  { senderId: 'user_ahmed', receiverId: 'user_lina',  content: 'شفت منشورك الجديد، جميل جداً!' },
  { senderId: 'user_sara',  receiverId: 'user_ahmed', content: 'أحمد، متى ترجع من الأقصر؟' },
  { senderId: 'user_ahmed', receiverId: 'user_sara',  content: 'بعد يومين إن شاء الله' },
  { senderId: 'user_nour',  receiverId: 'user_ali',   content: 'تمرين اليوم كان قوي' },
  { senderId: 'user_ali',   receiverId: 'user_nour',  content: 'شكراً، أنت كذلك!' },
];

async function main() {
  console.log('Starting database seed...\n');
  const hashedPassword = await bcrypt.hash('password123', 10);

  console.log('Creating users...');
  for (const u of USERS) {
    await prisma.user.upsert({
      where:  { id: u.id },
      update: {},
      create: { ...u, password: hashedPassword },
    });
  }
  console.log(`  ✓ ${USERS.length} users ready`);

  console.log('Creating posts...');
  for (const p of POSTS) {
    await prisma.post.upsert({
      where:  { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log(`  ✓ ${POSTS.length} posts ready`);

  console.log('Creating follows...');
  for (const f of FOLLOWS) {
    await prisma.follow.upsert({
      where:  { followerId_followingId: { followerId: f.followerId, followingId: f.followingId } },
      update: {},
      create: f,
    });
  }
  console.log(`  ✓ ${FOLLOWS.length} follows ready`);


  console.log('Creating likes...');
  for (const l of LIKES) {
    await prisma.like.upsert({
      where:  { userId_postId: { userId: l.userId, postId: l.postId } },
      update: {},
      create: l,
    });
  }
  console.log(`  ✓ ${LIKES.length} likes ready`);

  console.log('Creating reposts...');
  for (const r of REPOSTS) {
    await prisma.repost.upsert({
      where:  { userId_postId: { userId: r.userId, postId: r.postId } },
      update: {},
      create: r,
    });
  }
  console.log(`  ✓ ${REPOSTS.length} reposts ready`);

  console.log('Creating comments...');
  for (const c of COMMENTS) {
    await prisma.comment.create({ data: c });
  }
  console.log(`  ✓ ${COMMENTS.length} comments ready`);

  console.log('Creating messages...');
  for (const m of MESSAGES) {
    await prisma.message.create({ data: m });
  }
  console.log(`  ✓ ${MESSAGES.length} messages ready`);

  console.log('\n Seed complete! Database is ready.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });