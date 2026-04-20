import Image from 'next/image';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(255,255,255,0.15) 0%, transparent 50%)'
          }} />
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 relative">
          <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
            {/* Profile Photo */}
            <div className="animate-fade-up flex-shrink-0">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden border-4 border-white/30 shadow-2xl">
                <Image
                  src="/profile.jpg"
                  alt="Stan Wang"
                  width={224}
                  height={224}
                  className="w-full h-full object-cover object-top"
                  priority
                />
              </div>
            </div>
            {/* Info */}
            <div className="text-center md:text-left">
              <h1 className="animate-fade-up font-display text-4xl md:text-5xl font-bold mb-2">
                Stan Wang <span className="text-brand-200">王家宏</span>
              </h1>
              <p className="animate-fade-up animate-delay-1 text-lg md:text-xl text-brand-100 mb-4 font-light">
                Master&apos;s Student · National Taiwan University
              </p>
              <p className="animate-fade-up animate-delay-2 text-brand-100/80 max-w-lg leading-relaxed mb-6">
                AI &amp; Cybersecurity Researcher — Passionate about solving real-world problems through technology.
              </p>
              <div className="animate-fade-up animate-delay-3 flex flex-wrap gap-3 justify-center md:justify-start">
                <Link href="/board" className="px-6 py-2.5 bg-white text-brand-700 rounded-lg font-semibold hover:bg-brand-50 transition shadow-lg">
                  留言板 →
                </Link>
                <a href="mailto:l125879368@gmail.com" className="px-6 py-2.5 border-2 border-white/40 text-white rounded-lg font-medium hover:bg-white/10 transition">
                  聯絡我
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-ink-0 mb-8">關於我 About Me</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-5 text-ink-1 leading-relaxed">
            <p>
              你好！我是王家宏，大家都叫我 Stan。2003 年出生於台灣，對電腦與數學充滿好奇心。
              我畢業於國立台灣科技大學資訊工程系，輔修財務金融。
            </p>
            <p>
              目前我正在國立台灣大學電機工程學系攻讀資訊安全碩士學位。
              我的主要研究興趣是人工智慧與網路安全，同時也研究電子設計自動化 (EDA)。
              我喜歡探索如何將 AI 技術應用於解決安全挑戰，例如惡意軟體分類和自動化滲透測試。
            </p>
            <p>
              在研究之外，我是台大 AI 社的活躍成員，曾擔任講師教授機器學習與深度學習課程。
              閒暇時，我喜歡閱讀小說、看動漫、游泳以及探索新技術。
              我也喜歡在 LeetCode 上解題來磨練演算法思維。
            </p>
          </div>
          <div className="space-y-4">
            <InfoCard label="學歷" value="NTU 電機所碩士" />
            <InfoCard label="GPA (學士)" value="4.17 / 4.3" />
            <InfoCard label="系排名" value="Top 6.12%" />
            <InfoCard label="研究方向" value="AI & Security" />
            <InfoCard label="語言" value="TOEIC 藍色證書" />
            <InfoCard label="所在地" value="台北, 台灣" />
          </div>
        </div>
      </section>

      {/* Skills */}
      <section className="bg-white border-y border-surface-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
          <h2 className="font-display text-3xl font-bold text-ink-0 mb-10">技能 Skills</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkillCard icon="🤖" title="人工智慧" desc="PyTorch & TensorFlow 深度學習，CNN、RNN、DQN 及少樣本增量學習" tags={['PyTorch','TensorFlow','CNN','RNN']} />
            <SkillCard icon="📝" title="NLP & LLM" desc="ABSA-BERT 情感分析、RAG 流水線、LangChain & LlamaIndex" tags={['LangChain','RAG','BERT']} />
            <SkillCard icon="🔒" title="網路安全" desc="滲透測試、惡意軟體分析、CTF 競賽、自動化安全測試" tags={['Pen Testing','CTF','Kali']} />
            <SkillCard icon="💻" title="程式語言" desc="精通 Python 與 C/C++，也熟悉 Java、C# 等語言" tags={['Python','C++','Java']} />
            <SkillCard icon="🌐" title="Web 開發" desc="前端 Vue.js、React，後端 Django、Node.js，資料庫 MySQL" tags={['React','Django','MySQL']} />
            <SkillCard icon="⚡" title="EDA & IC" desc="電腦輔助晶片系統設計、EDA 軟體開發、FPGA" tags={['EDA','FPGA']} />
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 md:py-24">
        <h2 className="font-display text-3xl font-bold text-ink-0 mb-10">專案 Projects</h2>
        <div className="space-y-6">
          <ProjectCard year="2025-2026" title="Multimodal PentestGPT" desc="利用 LLM 進行自動化滲透測試的框架，整合 Kali MCP、Nmap 等工具" tags={['LLM','Security','Kali']} />
          <ProjectCard year="2025" title="SiMPACIN" desc="結合 Siamese 網路與原型網路的少樣本增量學習惡意軟體分類框架" tags={['Few-Shot','Malware']} />
          <ProjectCard year="2025" title="ABSA-BERT 情感分析" desc="針對加密貨幣文章的面向式情感分析，使用 DeBERTa 達到 70%+ 準確率" tags={['NLP','BERT']} />
          <ProjectCard year="2024" title="AI CUP 發電量預測" desc="使用 XGBoost 模型預測太陽能發電量，全國賽第 35 名 / 934 隊" tags={['XGBoost','ML']} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-0 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <p className="font-display text-xl font-bold mb-2">Stan Wang</p>
          <p className="text-ink-3 mb-4">NTU EE · AI & Cybersecurity</p>
          <div className="flex justify-center gap-4 text-sm text-ink-3">
            <a href="mailto:l125879368@gmail.com" className="hover:text-white transition">Email</a>
            <a href="https://github.com/StanOWO" target="_blank" rel="noopener" className="hover:text-white transition">GitHub</a>
          </div>
          <p className="text-ink-3/50 text-xs mt-6">© 2026 Stan Wang. Built with Next.js & Vercel.</p>
        </div>
      </footer>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="card p-4 flex justify-between items-center">
      <span className="text-ink-2 text-sm">{label}</span>
      <span className="font-semibold text-ink-0 text-sm">{value}</span>
    </div>
  );
}

function SkillCard({ icon, title, desc, tags }) {
  return (
    <div className="card p-6">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-display text-lg font-bold text-ink-0 mb-2">{title}</h3>
      <p className="text-ink-2 text-sm leading-relaxed mb-4">{desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map(t => (
          <span key={t} className="px-2.5 py-0.5 bg-brand-50 text-brand-700 text-xs font-medium rounded-full">{t}</span>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ year, title, desc, tags }) {
  return (
    <div className="card p-6 flex flex-col sm:flex-row gap-4">
      <div className="text-sm text-ink-2 font-mono min-w-[110px]">{year}</div>
      <div className="flex-1">
        <h3 className="font-display text-lg font-bold text-ink-0 mb-1">{title}</h3>
        <p className="text-ink-2 text-sm mb-3">{desc}</p>
        <div className="flex flex-wrap gap-1.5">
          {tags.map(t => (
            <span key={t} className="px-2.5 py-0.5 bg-surface-2 text-ink-1 text-xs font-medium rounded-full">{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}
