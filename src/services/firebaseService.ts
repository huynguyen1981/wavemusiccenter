import { 
  collection, 
  getDocs, 
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  where,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Piano, Order, PianoCategory, MusicEvent, ContactInquiry, Lesson, LessonClip } from '../types';

const PIANOS_COLLECTION = 'pianos';
const ORDERS_COLLECTION = 'orders';
const EVENTS_COLLECTION = 'events';
const INQUIRIES_COLLECTION = 'inquiries';
const LESSONS_COLLECTION = 'lessons';
const LESSON_CLIPS_COLLECTION = 'lesson_clips';

export const pianoService = {
  async getAllPianos(category?: PianoCategory) {
    let q = query(collection(db, PIANOS_COLLECTION), orderBy('createdAt', 'desc'));
    if (category) {
      q = query(q, where('category', '==', category));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Piano[];
  },

  async getPianoById(id: string) {
    const docRef = doc(db, PIANOS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Piano;
    }
    return null;
  },

  async addPiano(piano: Omit<Piano, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Date.now();
    const docRef = await addDoc(collection(db, PIANOS_COLLECTION), {
      ...piano,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  },

  async updatePiano(id: string, updates: Partial<Piano>) {
    const docRef = doc(db, PIANOS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  async deletePiano(id: string) {
    await deleteDoc(doc(db, PIANOS_COLLECTION, id));
  }
};

export const orderService = {
  async createOrder(order: Omit<Order, 'id' | 'createdAt' | 'status'>) {
    const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      ...order,
      status: 'pending',
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async getAllOrders() {
    const q = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
  },

  async updateOrderStatus(id: string, status: Order['status']) {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await updateDoc(docRef, { status });
  }
};

export const eventService = {
  async getAllEvents(includeHidden = false) {
    let q = query(collection(db, EVENTS_COLLECTION), orderBy('createdAt', 'desc'));
    if (!includeHidden) {
      q = query(q, where('status', '!=', 'hidden'));
    }
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as MusicEvent[];
  },

  async getEventById(id: string) {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as MusicEvent;
    }
    return null;
  },

  async addEvent(event: Omit<MusicEvent, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, EVENTS_COLLECTION), {
      ...event,
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async updateEvent(id: string, updates: Partial<MusicEvent>) {
    const docRef = doc(db, EVENTS_COLLECTION, id);
    await updateDoc(docRef, updates);
  },

  async deleteEvent(id: string) {
    await deleteDoc(doc(db, EVENTS_COLLECTION, id));
  }
};

export const inquiryService = {
  async createInquiry(inquiry: Omit<ContactInquiry, 'id' | 'createdAt' | 'status'>) {
    const docRef = await addDoc(collection(db, INQUIRIES_COLLECTION), {
      ...inquiry,
      status: 'new',
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async getAllInquiries() {
    const q = query(collection(db, INQUIRIES_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ContactInquiry[];
  },

  async updateInquiryStatus(id: string, status: ContactInquiry['status']) {
    const docRef = doc(db, INQUIRIES_COLLECTION, id);
    await updateDoc(docRef, { status });
  },

  async deleteInquiry(id: string) {
    await deleteDoc(doc(db, INQUIRIES_COLLECTION, id));
  }
};

const SETTINGS_COLLECTION = 'settings';
const GLOBAL_SETTINGS_ID = 'global';

export const settingsService = {
  async getSettings() {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_ID);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return snapshot.data() as { translations: Record<string, { en: string; vi: string }> };
    }
    return null;
  },

  async updateSettings(translations: Record<string, { en: string; vi: string }>) {
    const docRef = doc(db, SETTINGS_COLLECTION, GLOBAL_SETTINGS_ID);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      await updateDoc(docRef, { translations });
    } else {
      const { setDoc } = await import('firebase/firestore');
      await setDoc(docRef, { translations });
    }
  }
};

export const lessonService = {
  async getAllLessons() {
    const q = query(collection(db, LESSONS_COLLECTION), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Lesson[];
  },

  async getLessonById(id: string) {
    const docRef = doc(db, LESSONS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as Lesson;
    }
    return null;
  },

  async addLesson(id: string, lesson: Omit<Lesson, 'id' | 'createdAt' | 'updatedAt'>) {
    const now = Date.now();
    await setDoc(doc(db, LESSONS_COLLECTION, id), {
      ...lesson,
      createdAt: now,
      updatedAt: now
    });
    return id;
  },

  async updateLesson(id: string, updates: Partial<Lesson>) {
    const docRef = doc(db, LESSONS_COLLECTION, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Date.now()
    });
  },

  async deleteLesson(id: string) {
    await deleteDoc(doc(db, LESSONS_COLLECTION, id));
  },

  async seedDefaultLessons() {
    // Top-level items
    const topLevels = [
      {
        id: 'overview',
        title_en: 'OVERVIEW',
        title_vi: 'TỔNG QUAN',
        subtitle_en: 'Intro text, teaching philosophy',
        subtitle_vi: 'Tổng quan - Triết lý giảng dạy & Giới thiệu',
        icon: 'BookOpen',
        parentId: null,
        order: 1,
        content_en: '### Welcome to Wave Music Center\n\nOur philosophy centers on nurturing creativity, technique, and a lifelong love for music. Whether you are beginning your musical journey or preparing for prestigious performance diplomas, our curriculum is personalized to unleash your inner artist.\n\n#### Why Choose Wave?\n- **Elite Faculty**: Graduates from top conservatories.\n- **Premium Instruments**: Practice on concert-grade grand pianos.\n- **Global Standards**: Complete preparation for ABRSM / Trinity College London.\n- **Vibrant Community**: Masterclasses, student recitals, and prestigious concerts.',
        content_vi: '### Chào mừng đến với Trung tâm Âm nhạc Wave\n\nTriết lý giáo dục của chúng tôi tập trung vào việc nuôi dưỡng sự sáng tạo, kỹ thuật và tình yêu âm nhạc trọn đời. Dù bạn mới bắt đầu hành trình âm nhạc hay đang chuẩn bị cho các kỳ thi chứng chỉ chuyên nghiệp, chương trình đào tạo của chúng tôi đều được cá nhân hóa để đánh thức tiềm năng nghệ thuật trong bạn.\n\n#### Tại sao nên chọn Wave?\n- **Đội ngũ giảng viên ưu tú**: Tốt nghiệp từ các học viện âm nhạc hàng đầu.\n- **Nhạc cụ cao cấp**: Học và luyện tập trên các cây đàn piano grand chuẩn biểu diễn.\n- **Tiêu chuẩn quốc tế**: Chương trình bám sát các kỳ thi chứng chỉ ABRSM / Trinity London.\n- **Cộng đồng sôi động**: Thường xuyên tổ chức Masterclass, báo cáo học tập và các sự kiện âm nhạc chuyên nghiệp.'
      },
      {
        id: 'piano_programs',
        title_en: 'PIANO PROGRAMS',
        title_vi: 'CÁC LỚP PIANO',
        subtitle_en: 'Piano Classes',
        subtitle_vi: 'Các lớp học piano đa dạng cho mọi lứa tuổi',
        icon: 'Music',
        parentId: null,
        order: 2,
        content_en: '### Dynamic Piano Programs\n\nWe offer piano classes tailored for different ages, levels, and aspirations. From complete beginners to professional levels, you will find a dedicated space to grow at Wave Music Center.',
        content_vi: '### Chương trình Piano Đa dạng\n\nChúng tôi thiết diện các chương trình đào tạo phù hợp cho mọi lứa tuổi, trình độ và mục tiêu cá nhân. Từ các lớp học vỡ lòng đến luyện thi chuyên sâu, bạn sẽ luôn tìm thấy lộ trình phù hợp tại Wave.'
      },
      {
        id: 'abrsm_prep',
        title_en: 'ABRSM PREP (Piano)',
        title_vi: 'LUYỆN THI ABRSM - THỰC HÀNH',
        subtitle_en: 'ABRSM Practical Exam Preparation',
        subtitle_vi: 'Luyện thi chứng chỉ quốc tế ABRSM Thực Hành',
        icon: 'Award',
        parentId: null,
        order: 3,
        content_en: '### ABRSM Practical Exam Prep\n\nPrepare for your ABRSM Practical examinations with our comprehensive syllabus, focusing on pieces, scales, sight-reading, and aural tests.',
        content_vi: '### Luyện thi ABRSM Thực hành\n\nChuẩn bị tốt nhất cho kỳ thi Thực hành ABRSM cùng giáo trình toàn diện của chúng tôi, tập trung vào tác phẩm, kỹ thuật, thị tấu và khả năng nghe cảm thụ.'
      },
      {
        id: 'abrsm_theory',
        title_en: 'ABRSM THEORY',
        title_vi: 'LUYỆN THI LÝ THUYẾT ÂM NHẠC',
        subtitle_en: 'ABRSM Music Theory Exam Prep',
        subtitle_vi: 'Luyện thi chứng chỉ quốc tế ABRSM Lý Thuyết',
        icon: 'BookOpen',
        parentId: null,
        order: 4,
        content_en: '### ABRSM Music Theory\n\nDeepen your understanding of musical language. Theory training enhances your general musicianship and is highly recommended (and required from Grade 5 onwards for practical levels).',
        content_vi: '### Lý thuyết Âm nhạc ABRSM\n\nHiểu sâu sắc về ngôn ngữ âm nhạc. Khóa học lý thuyết giúp bạn nâng cao tư duy âm nhạc toàn diện và là bắt buộc từ Grade 5 trở đi nếu muốn thi thực hành bậc cao.'
      },
      {
        id: 'tuition_fees',
        title_en: 'TUITION FEES',
        title_vi: 'HỌC PHÍ',
        subtitle_en: 'Tuition Fees',
        subtitle_vi: 'Học phí và các gói đào tạo tại Trung tâm',
        icon: 'DollarSign',
        parentId: null,
        order: 5,
        content_en: '### Fair & Transparent Tuition Packages\n\nWe offer flexible packages designed to match your weekly schedule and intensive levels. Check our sub-items to find details on Packages and Registration Fees.',
        content_vi: '### Học phí Minh bạch & Linh hoạt\n\nChúng tôi cung cấp các gói học phí linh hoạt phù hợp với lịch học hàng tuần và mức độ chuyên sâu của bạn. Xem chi tiết các mục con để biết về Học phí và Phí đăng ký.'
      },
      {
        id: 'policies',
        title_en: 'POLICIES',
        title_vi: 'CHÍNH SÁCH HỌC VỤ',
        subtitle_en: 'Academic Policies',
        subtitle_vi: 'Nội quy học tập & Quy định tại Wave',
        icon: 'FileText',
        parentId: null,
        order: 6,
        content_en: '### Academy Policies\n\nTo ensure a professional and fair environment for all students and instructors, please carefully read through our Payment, Makeup, and General Policies.',
        content_vi: '### Chính sách & Nội quy học vụ\n\nĐể đảm bảo môi trường học tập chuyên nghiệp và công bằng cho cả học viên và giảng viên, xin vui lòng đọc kỹ các chính sách về thanh toán học phí, bảo lưu, học bù.'
      },
      {
        id: 'enrollment',
        title_en: 'ENROLLMENT',
        title_vi: 'ĐĂNG KÝ HỌC',
        subtitle_en: 'Enrollment & Admission',
        subtitle_vi: 'Quy trình và Thủ tục đăng ký nhập học',
        icon: 'Calendar',
        parentId: null,
        order: 7,
        content_en: '### Start Your Musical Journey\n\nReady to elevate your musical skills? Complete our online registration form or book a 30-minute trial session with our Senior Instructor.',
        content_vi: '### Bắt đầu Hành trình Âm nhạc của Bạn\n\nBạn đã sẵn sàng nâng tầm kỹ năng âm nhạc của mình? Điền đơn đăng ký trực tuyến ngay hôm nay hoặc đặt lịch trải nghiệm buổi học thử 30 phút cùng Giảng viên cao cấp.'
      }
    ];

    const children = [
      // Piano programs children
      { parentId: 'piano_programs', order: 1, title_en: 'For Kids', title_vi: 'Cho Trẻ Em', content_en: '### Piano for Kids\nDesigned for children aged 4-12. We make learning interactive and highly rewarding through rhythm games, color coding, and ear training.', content_vi: '### Piano cho Trẻ em\nDành cho các bé từ 4-12 tuổi. Phương pháp sinh động thông qua trò chơi tiết tấu, cảm thụ âm nhạc, tạo niềm vui và thói quen luyện tập.' },
      { parentId: 'piano_programs', order: 2, title_en: 'For Adults', title_vi: 'Cho Người Lớn', content_en: '### Piano for Adults\nPerfect for busy adults wanting to learn their favorite classical or pop music piece in a structured and accelerated manner.', content_vi: '### Piano cho Người lớn\nLộ trình được thiết kế riêng cho người lớn bận rộn. Giúp bạn nhanh chóng làm chủ nhạc cụ, tự tin chơi các tác phẩm yêu thích.' },
      { parentId: 'piano_programs', order: 3, title_en: 'Hobbies & Leisure', title_vi: 'Giải Trí/Sở Thích', content_en: '### Hobbies & Leisure Piano\nFocuses on playing popular songs, classic ballads, and film sound tracks without the pressure of formal exams.', content_vi: '### Khóa học Piano Giải Trí\nTập trung vào nhạc nhẹ, nhạc phim, các bản tình ca quen thuộc, giúp bạn giải tỏa căng thẳng và thỏa mãn đam mê mà không áp lực thi cử.' },

      // ABRSM Practical Prep children
      { parentId: 'abrsm_prep', order: 1, title_en: 'Grade 1', title_vi: 'Grade 1', content_en: '### ABRSM Practical - Grade 1\nFocuses on basic classical repertoire, simple hand coordination, major/minor scales, and introductory sight-reading.', content_vi: '### ABRSM Thực Hành - Grade 1\nTập trung vào các tác phẩm cổ điển cơ bản, phối hợp tay đơn giản, các thang âm trưởng/thứ và làm quen với thị tấu.' },
      { parentId: 'abrsm_prep', order: 2, title_en: 'Grade 2', title_vi: 'Grade 2', content_en: '### ABRSM Practical - Grade 2\nExpands on technical agility, dynamic expression, and reading fluency.', content_vi: '### ABRSM Thực Hành - Grade 2\nMở rộng về kỹ năng linh hoạt ngón, kiểm soát sắc thái to nhỏ và khả năng đọc nhạc lưu loát.' },
      { parentId: 'abrsm_prep', order: 3, title_en: 'Grade 3', title_vi: 'Grade 3', content_en: '### ABRSM Practical - Grade 3\nIntroduces complex time signatures, compound structures, and deeper stylistic phrasing.', content_vi: '### ABRSM Thực Hành - Grade 3\nLàm quen với các nhịp phức tạp, cấu trúc bài đa dạng và xử lý câu nhạc sâu sắc hơn.' },
      { parentId: 'abrsm_prep', order: 4, title_en: 'Grade 4', title_vi: 'Grade 4', content_en: '### ABRSM Practical - Grade 4\nAdvanced intermediate pieces, subtle pedaling, and rigorous sight-reading standards.', content_vi: '### ABRSM Thực Hành - Grade 4\nCác tác phẩm trung cấp, kỹ thuật sử dụng pedal tinh tế và nâng cao chuẩn mực thị tấu.' },
      { parentId: 'abrsm_prep', order: 5, title_en: 'Grade 5', title_vi: 'Grade 5', content_en: '### ABRSM Practical - Grade 5\nIntermediate benchmark. Encompasses demanding technical control, stylistic maturity, and strong musicianship.', content_vi: '### ABRSM Thực Hành - Grade 5\nCột mốc trung cấp quan trọng. Đòi hỏi khả năng làm chủ kỹ thuật cao, chín chắn về phong cách và tư duy âm nhạc nhạy bén.' },
      { parentId: 'abrsm_prep', order: 6, title_en: 'Grade 6', title_vi: 'Grade 6', content_en: '### ABRSM Practical - Grade 6\nAdvanced level. Requires rich emotional depth, advanced finger independency, and polished stage presence.', content_vi: '### ABRSM Thực Hành - Grade 6\nTrình độ cao cấp. Đòi hỏi chiều sâu cảm xúc, khả năng độc lập ngón điêu luyện và bản lĩnh sân khấu hoàn thiện.' },
      { parentId: 'abrsm_prep', order: 7, title_en: 'Grade 7', title_vi: 'Grade 7', content_en: '### ABRSM Practical - Grade 7\nNear-professional repertoire. Mastery of different era-styles (Baroque, Classical, Romantic, 20th century).', content_vi: '### ABRSM Thực Hành - Grade 7\nTác phẩm cận chuyên nghiệp. Thành thạo các phong cách âm nhạc thuộc nhiều thời kỳ khác nhau (Baroque, Cổ điển, Lãng mạn, Thế kỷ 20).' },
      { parentId: 'abrsm_prep', order: 8, title_en: 'Grade 8', title_vi: 'Grade 8', content_en: '### ABRSM Practical - Grade 8\nThe pinnacle of ABRSM practical grades. Complete mastery of advanced technical works, brilliant artistry, and superb expression.', content_vi: '### ABRSM Thực Hành - Grade 8\nBậc cao nhất trong thang điểm ABRSM. Đòi hỏi kỹ thuật đỉnh cao, tính nghệ thuật hoàn thiện và khả năng truyền cảm xuất sắc.' },

      // ABRSM Theory children
      { parentId: 'abrsm_theory', order: 1, title_en: 'Grade 1', title_vi: 'Grade 1', content_en: '### Music Theory - Grade 1\nBasic notation, notes value, treble/bass clefs, and simple time signatures.', content_vi: '### Lý thuyết Âm nhạc - Grade 1\nKý âm cơ bản, giá trị nốt nhạc, khóa Sol/Fa, và các nhịp đơn giản.' },
      { parentId: 'abrsm_theory', order: 2, title_en: 'Grade 2', title_vi: 'Grade 2', content_en: '### Music Theory - Grade 2\nKey signatures, triplets, ledger lines, and major keys up to three sharps/flats.', content_vi: '### Lý thuyết Âm nhạc - Grade 2\nHóa biểu, nốt liên ba, dòng kẻ phụ, và các giọng trưởng có đến 3 dấu thăng/giáng.' },
      { parentId: 'abrsm_theory', order: 3, title_en: 'Grade 3', title_vi: 'Grade 3', content_en: '### Music Theory - Grade 3\nTransposition, minor keys up to four sharps/flats, interval calculations.', content_vi: '### Lý thuyết Âm nhạc - Grade 3\nDịch giọng, giọng thứ có đến 4 dấu thăng/giáng, tính toán quãng âm nhạc.' },
      { parentId: 'abrsm_theory', order: 4, title_en: 'Grade 4', title_vi: 'Grade 4', content_en: '### Music Theory - Grade 4\nAlto clef, double sharps/flats, chromatic scales, and basic chord voice-leading.', content_vi: '### Lý thuyết Âm nhạc - Grade 4\nKhóa Đô (Alto), dấu thăng/giáng kép, thang âm bán âm (chromatic), và dẫn bước hợp âm cơ bản.' },
      { parentId: 'abrsm_theory', order: 5, title_en: 'Grade 5', title_vi: 'Grade 5', content_en: '### Music Theory - Grade 5\nAdvanced intervals, chord progressions, cadences, instrument ranges, and tenor clef. Passing this grade is a prerequisite for higher-level practical exams.', content_vi: '### Lý thuyết Âm nhạc - Grade 5\nQuãng nâng cao, các vòng hòa thanh, kết cấu câu nhạc, âm vực các nhạc cụ và khóa Đô (Tenor). Đỗ Grade 5 lý thuyết là bắt buộc để dự thi các Grade 6-8 thực hành.' },

      // Tuition fees children
      { parentId: 'tuition_fees', order: 1, title_en: 'Details & Packages', title_vi: 'Chi tiết các gói', content_en: '### Tuition Fees & Course Packages\nWe offer private 1-on-1 coaching packages to guarantee progress:\n\n- **Standard Starter Package**: 12 sessions / 45 mins per session.\n- **Premium Intensive Package**: 24 sessions / 60 mins per session with Senior Instructors.\n- **Masterclass Combo**: Encompasses practical piano classes paired with free theory masterclasses.\n\n*Please contact our registration desk for current promotional discounts.*', content_vi: '### Học phí & Các Gói Học\nChúng tôi cung cấp các gói học kèm 1-on-1 cá nhân hóa để đảm bảo kết quả tốt nhất:\n\n- **Gói Standard Khởi đầu**: Khóa 12 buổi / 45 phút mỗi buổi.\n- **Gói Premium Chuyên sâu**: Khóa 24 buổi / 60 phút mỗi buổi cùng Giảng viên cao cấp.\n- **Combo Masterclass**: Tích hợp lớp thực hành cùng vé tham gia các buổi học lý thuyết/cảm thụ âm nhạc miễn phí.\n\n*Liên hệ bộ phận tư vấn để nhận thông tin ưu đãi học phí hiện hành.*' },
      { parentId: 'tuition_fees', order: 2, title_en: 'Registration Fee', title_vi: 'Phí Đăng ký', content_en: '### Registration & Material Fees\n\n- **One-time Registration Fee**: Includes textbook, visual aides, practice notebook, and Wave Welcome Kit.\n- **Annual Exam Registration Admin Fee**: Admin support for compiling candidate entries for ABRSM examinations.', content_vi: '### Phí Ghi Danh & Giáo Trình\n\n- **Phí đăng ký học viên mới (đóng 1 lần)**: Đã bao gồm giáo trình quốc tế, giáo cụ học tập trực quan, sổ theo dõi học tập và Bộ quà tặng Wave Kit.\n- **Lệ phí hồ sơ thi cử**: Hỗ trợ thủ tục đăng ký thi chứng chỉ quốc tế ABRSM hàng năm.' },

      // Policies children
      { parentId: 'policies', order: 1, title_en: 'Payment Policy', title_vi: 'Thanh toán', content_en: '### Tuition Fee Payment Policies\n\n- Tuition fees must be fully settled prior to the first session of each course.\n- We accept Bank Transfers, Credit Cards, and Cash payments.', content_vi: '### Chính Sách Đóng Học Phí\n\n- Học phí cần được hoàn tất đầy đủ trước buổi học đầu tiên của mỗi khóa.\n- Chấp nhận các hình thức chuyển khoản ngân hàng, thanh toán thẻ, và tiền mặt.' },
      { parentId: 'policies', order: 2, title_en: 'Attendance & Makeup', title_vi: 'Nghỉ học & Bù', content_en: '### Cancellation & Makeup Classes\n\n- To reschedule or cancel a session, students must notify Wave at least **24 hours** in advance.\n- Cancellations within 24 hours will be counted as attended, except for medical emergencies.', content_vi: '### Chính Sách Học Bù & Nghỉ Học\n\n- Để hủy hoặc đổi lịch học, học viên cần thông báo trước ít nhất **24 giờ**.\n- Mọi thông báo trễ hơn sẽ tính là vắng mặt và tính trừ buổi học (trừ trường hợp khẩn cấp có lý do y tế).' },
      { parentId: 'policies', order: 3, title_en: 'General Rules', title_vi: 'Quy định chung', content_en: '### Academic General Regulations\n\n- Students must arrive on time. Late arrivals will not receive extended class durations.\n- Maintain absolute silence in wait lines and corridors to guarantee active concentration inside studios.', content_vi: '### Quy Định Học Tập Chung\n\n- Học viên vui lòng đến đúng giờ. Giảng viên sẽ kết thúc đúng lịch và không thể bù giờ cho các bạn đi trễ.\n- Giữ gìn trật tự tại sảnh chờ và hành lang để tránh làm phiền các lớp đang học bên trong phòng cách âm.' },

      // Enrollment children
      { parentId: 'enrollment', order: 1, title_en: 'Online Form', title_vi: 'Đăng ký online', content_en: '### Online Application Process\n\nEnroll easily through our quick form! Simply click the "Inquire" button on the Contact page, fill in your learning goals, and our academic director will schedule a personalized interview and audition for you.', content_vi: '### Đăng Ký Học Trực Tuyến\n\nTuyển sinh cực kỳ đơn giản qua trang Liên hệ! Hãy gửi tin nhắn qua biểu mẫu, nêu rõ mục tiêu học tập, Giám đốc học thuật của chúng tôi sẽ liên hệ xếp lịch kiểm tra xếp lớp phù hợp nhất cho bạn.' },
      { parentId: 'enrollment', order: 2, title_en: 'Trial Lesson', title_vi: 'Học thử', content_en: '### 30-Minute Trial Session\n\nWe offer a trial session where you will explore the piano, learn basic hand positions, play your very first melody, and receive professional advice on your current level and goals.', content_vi: '### Trải Nghiệm Buổi Học Thử 30 Phút\n\nWave hỗ trợ một buổi trải nghiệm thực tế cùng giảng viên để bạn làm quen phím đàn, tư thế ngồi chuẩn, chơi một vài giai điệu đơn giản đầu tiên, và nhận phản hồi chuyên môn về năng khiếu của mình.' }
    ];

    const { setDoc } = await import('firebase/firestore');
    
    // Seed top levels
    for (const tl of topLevels) {
      const docRef = doc(db, LESSONS_COLLECTION, tl.id);
      await setDoc(docRef, {
        title_en: tl.title_en,
        title_vi: tl.title_vi,
        subtitle_en: tl.subtitle_en,
        subtitle_vi: tl.subtitle_vi,
        icon: tl.icon,
        parentId: tl.parentId,
        order: tl.order,
        content_en: tl.content_en,
        content_vi: tl.content_vi,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }

    // Seed children
    for (let i = 0; i < children.length; i++) {
      const c = children[i];
      const customId = `${c.parentId}_child_${i}`;
      const docRef = doc(db, LESSONS_COLLECTION, customId);
      await setDoc(docRef, {
        title_en: c.title_en,
        title_vi: c.title_vi,
        content_en: c.content_en,
        content_vi: c.content_vi,
        parentId: c.parentId,
        order: c.order,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
    }
  }
};

export const lessonClipService = {
  async getAllLessonClips() {
    const q = query(collection(db, LESSON_CLIPS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as LessonClip[];
  },

  async getLessonClipById(id: string) {
    const docRef = doc(db, LESSON_CLIPS_COLLECTION, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as LessonClip;
    }
    return null;
  },

  async addLessonClip(clip: Omit<LessonClip, 'id' | 'createdAt'>) {
    const docRef = await addDoc(collection(db, LESSON_CLIPS_COLLECTION), {
      ...clip,
      createdAt: Date.now()
    });
    return docRef.id;
  },

  async updateLessonClip(id: string, updates: Partial<LessonClip>) {
    const docRef = doc(db, LESSON_CLIPS_COLLECTION, id);
    await updateDoc(docRef, updates);
  },

  async deleteLessonClip(id: string) {
    await deleteDoc(doc(db, LESSON_CLIPS_COLLECTION, id));
  }
};

