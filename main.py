from pathlib import Path
import zipfile, shutil, re, os

css = r'''@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

/* =========================================================
   CIRCULARHUB — MATCHED TO THE CURRENT App.tsx
   Premium purple / violet UI
   Dark + light mode
   ========================================================= */

:root{
  --bg:#0b0711;
  --bg2:#110a18;
  --surface:#171021;
  --surface2:#1e142b;
  --surface3:#281a38;
  --purple:#a855f7;
  --purple2:#8b5cf6;
  --purpleLight:#d8b4fe;
  --pink:#ec4899;
  --text:#faf7ff;
  --text2:#ded5e8;
  --muted:#a99db5;
  --border:rgba(216,180,254,.16);
  --borderStrong:rgba(192,132,252,.34);
  --success:#6ee7a3;
  --warning:#fbbf72;
  --danger:#fb7185;
  --shadow:0 24px 70px rgba(0,0,0,.34);
  --glow:0 20px 65px rgba(168,85,247,.20);
  --radius:18px;
  --radius2:24px;
  --nav:78px;
}

.app.light{
  --bg:#f7f3fa;
  --bg2:#efe8f5;
  --surface:#ffffff;
  --surface2:#fbf8fd;
  --surface3:#f0e7f5;
  --purple:#8b3fd1;
  --purple2:#7c3aed;
  --purpleLight:#8b3fd1;
  --pink:#db2777;
  --text:#24182d;
  --text2:#4d4057;
  --muted:#786b82;
  --border:rgba(75,45,95,.13);
  --borderStrong:rgba(139,63,209,.28);
  --shadow:0 18px 50px rgba(65,35,85,.10);
  --glow:0 18px 55px rgba(139,63,209,.14);
}

*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth;scroll-padding-top:96px}
body{
  min-width:320px;
  min-height:100vh;
  background:var(--bg);
  color:var(--text);
  font-family:"Inter","Manrope",sans-serif;
  overflow-x:hidden;
}
button,input,select,textarea{font:inherit}
button{cursor:pointer}
button,a{ -webkit-tap-highlight-color:transparent }
button{border:0}
a{text-decoration:none;color:inherit}
img{display:block;max-width:100%}
::selection{background:rgba(168,85,247,.35);color:#fff}

.app{
  min-height:100vh;
  color:var(--text);
  background:
    radial-gradient(circle at 8% 0%,rgba(168,85,247,.11),transparent 26%),
    radial-gradient(circle at 92% 8%,rgba(139,92,246,.09),transparent 24%),
    var(--bg);
  transition:background .3s ease,color .3s ease;
}
.app::before{
  content:"";
  position:fixed;
  inset:0;
  z-index:0;
  pointer-events:none;
  opacity:.20;
  background-image:
    linear-gradient(rgba(255,255,255,.018) 1px,transparent 1px),
    linear-gradient(90deg,rgba(255,255,255,.018) 1px,transparent 1px);
  background-size:44px 44px;
}
.app > *{position:relative;z-index:1}

::-webkit-scrollbar{width:9px}
::-webkit-scrollbar-track{background:var(--bg)}
::-webkit-scrollbar-thumb{
  border-radius:999px;
  border:2px solid var(--bg);
  background:linear-gradient(180deg,var(--purple),var(--purple2));
}

/* =========================================================
   NAVBAR
   ========================================================= */

.navbar{
  position:sticky;
  top:0;
  z-index:2000;
  height:var(--nav);
  border-bottom:1px solid var(--border);
  background:rgba(11,7,17,.82);
  backdrop-filter:blur(22px);
  -webkit-backdrop-filter:blur(22px);
}
.app.light .navbar{background:rgba(255,255,255,.88)}

.navInner{
  width:min(1440px,94%);
  height:100%;
  margin:auto;
  display:flex;
  align-items:center;
  gap:22px;
}

.brand{
  flex:0 0 auto;
  display:flex;
  align-items:center;
  gap:10px;
  background:none;
  color:var(--text);
  font-size:18px;
  font-weight:800;
  letter-spacing:-.5px;
}
.brandIcon{
  width:42px;height:42px;
  display:grid;place-items:center;
  border-radius:13px;
  color:#fff;
  background:linear-gradient(135deg,var(--purple),var(--purple2));
  box-shadow:0 10px 28px rgba(168,85,247,.28);
}
.brand:hover .brandIcon{transform:rotate(-6deg) scale(1.04)}
.brandIcon{transition:transform .25s ease}

.desktopNav{
  flex:1;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:2px;
}
.desktopNav button,
.mobileMenu button{
  position:relative;
  padding:10px 11px;
  border-radius:10px;
  background:transparent;
  color:var(--muted);
  font-size:12px;
  font-weight:700;
  transition:.2s ease;
}
.desktopNav button:hover,
.mobileMenu button:hover{
  color:var(--text);
  background:rgba(168,85,247,.09);
}
.desktopNav button.active{
  color:#fff;
  background:linear-gradient(135deg,rgba(168,85,247,.25),rgba(124,58,237,.13));
  box-shadow:inset 0 0 0 1px rgba(216,180,254,.12);
}
.app.light .desktopNav button.active{color:var(--purple2)}

.navActions{
  flex:0 0 auto;
  display:flex;
  align-items:center;
  gap:7px;
}
.iconButton{
  position:relative;
  width:40px;height:40px;
  display:grid;place-items:center;
  border:1px solid var(--border);
  border-radius:12px;
  color:var(--text);
  background:var(--surface);
  transition:.2s ease;
}
.iconButton:hover{
  transform:translateY(-2px);
  border-color:var(--borderStrong);
  background:var(--surface2);
  box-shadow:0 10px 28px rgba(0,0,0,.14);
}
.notificationDot{
  position:absolute;
  top:8px;right:8px;
  width:7px;height:7px;
  border-radius:50%;
  background:var(--pink);
  box-shadow:0 0 0 3px var(--surface);
}
.avatar{
  width:40px;height:40px;
  display:grid;place-items:center;
  border-radius:50%;
  color:#fff;
  background:linear-gradient(135deg,var(--purple),var(--pink));
  font-size:12px;
  font-weight:800;
  box-shadow:0 8px 22px rgba(168,85,247,.20);
}
.profileName{
  padding:9px 4px;
  color:var(--text2);
  background:none;
  font-size:12px;
  font-weight:700;
}
.listButton,
.primaryButton,
.secondaryButton,
.outlineButton{
  min-height:44px;
  display:inline-flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  padding:0 17px;
  border-radius:12px;
  font-size:12px;
  font-weight:800;
  transition:.22s ease;
}
.listButton,.primaryButton{
  color:#fff;
  background:linear-gradient(135deg,var(--purple),var(--purple2));
  box-shadow:0 11px 28px rgba(168,85,247,.22);
}
.listButton:hover,.primaryButton:hover{
  transform:translateY(-2px);
  box-shadow:0 16px 34px rgba(168,85,247,.30);
}
.secondaryButton{
  color:var(--text);
  background:var(--surface2);
  border:1px solid var(--border);
}
.secondaryButton:hover{
  transform:translateY(-2px);
  border-color:var(--borderStrong);
}
.outlineButton{
  color:var(--text2);
  background:transparent;
  border:1px solid var(--borderStrong);
}
.outlineButton:hover{
  color:var(--text);
  background:rgba(168,85,247,.09);
  border-color:var(--purple);
  transform:translateY(-2px);
}
.full{width:100%}

.mobileMenuButton{
  display:none;
  width:40px;height:40px;
  place-items:center;
  border:1px solid var(--border);
  border-radius:12px;
  color:var(--text);
  background:var(--surface);
}
.mobileMenu{
  display:none;
}

/* =========================================================
   GLOBAL LAYOUT / TYPE
   ========================================================= */

.section{
  width:min(1240px,92%);
  margin:auto;
  padding:92px 0;
}
.eyebrow{
  display:inline-flex;
  align-items:center;
  gap:9px;
  margin-bottom:16px;
  color:var(--purpleLight);
  font-size:10px;
  font-weight:800;
  letter-spacing:2px;
  text-transform:uppercase;
}
.eyebrow::before{
  content:"";
  width:26px;height:2px;
  border-radius:999px;
  background:linear-gradient(90deg,var(--purple),var(--pink));
}
h1,h2,h3,h4{letter-spacing:-1px}
h1{font-size:clamp(44px,6.5vw,78px);line-height:.98;font-weight:800}
h2{font-size:clamp(31px,4.2vw,52px);line-height:1.02;font-weight:800}
h3{font-size:19px;line-height:1.2}
p{line-height:1.7}
.serif{font-family:"Playfair Display",Georgia,serif;font-style:italic}
.muted{color:var(--muted)}

/* =========================================================
   HERO
   ========================================================= */

.hero{
  min-height:calc(100vh - var(--nav));
  padding-top:72px;
  padding-bottom:72px;
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(420px,560px);
  align-items:center;
  gap:50px;
}
.heroContent{max-width:690px}
.heroText{
  max-width:620px;
  margin:23px 0 30px;
  color:var(--muted);
  font-size:16px;
}
.heroButtons{
  display:flex;
  flex-wrap:wrap;
  gap:11px;
}
.trustRow{
  display:flex;
  flex-wrap:wrap;
  align-items:center;
  gap:10px 20px;
  margin-top:25px;
  color:var(--muted);
  font-size:11px;
  font-weight:600;
}
.trustRow span{display:inline-flex;align-items:center;gap:7px}

/* =========================================================
   CIRCULARHUB ORBIT
   ========================================================= */

.orbitArea{
  position:relative;
  width:min(550px,100%);
  aspect-ratio:1;
  margin:auto;
  display:grid;
  place-items:center;
}
.orbitGlow{
  position:absolute;
  width:75%;
  height:75%;
  border-radius:50%;
  background:radial-gradient(circle,rgba(168,85,247,.18),transparent 68%);
  filter:blur(4px);
}
.orbit{
  position:absolute;
  inset:3%;
  border-radius:50%;
  animation:orbitSpin 30s linear infinite;
}
.orbitRing{
  position:absolute;
  border-radius:50%;
  border:1px solid rgba(192,132,252,.18);
  inset:0;
}
.ringOne{inset:8%}
.ringTwo{inset:19%;border-style:dashed}
.ringThree{inset:30%}
@keyframes orbitSpin{to{transform:rotate(360deg)}}

.orbitNode{
  position:absolute;
  width:88px;height:88px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:6px;
  border-radius:25px;
  color:var(--text);
  background:linear-gradient(145deg,var(--surface2),var(--surface));
  border:1px solid var(--borderStrong);
  box-shadow:var(--shadow);
  z-index:3;
  animation:counterSpin 30s linear infinite;
  transition:.25s ease;
}
@keyframes counterSpin{to{transform:rotate(-360deg)}}
.orbitNode:hover{
  animation-play-state:paused;
  transform:scale(1.08)!important;
  border-color:var(--purpleLight);
  box-shadow:var(--glow);
}
.orbitNode svg{color:var(--purpleLight)}
.orbitNode span{
  font-size:9px;
  font-weight:800;
  letter-spacing:1px;
  text-transform:uppercase;
}
.nodeBuy{top:0;left:50%;margin-left:-44px}
.nodeSell{top:17%;right:1%}
.nodeSwap{bottom:17%;right:1%}
.nodeDonate{bottom:0;left:50%;margin-left:-44px}
.nodeRepair{bottom:17%;left:1%}
.nodeRecycle{top:17%;left:1%}
.orbitCenter{
  position:relative;
  z-index:5;
  width:158px;height:158px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  border-radius:50%;
  color:#fff;
  background:radial-gradient(circle at 32% 25%,#54266f,#1c1027 68%);
  border:1px solid var(--borderStrong);
  box-shadow:0 0 90px rgba(168,85,247,.28),inset 0 0 35px rgba(255,255,255,.03);
}
.orbitCenter strong{font-size:18px}
.orbitCenter span{margin-top:5px;color:#c6b9d2;font-size:10px}

/* =========================================================
   STATS
   ========================================================= */

.statsSection{
  width:min(1240px,92%);
  margin:auto;
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:14px;
}
.statCard{
  min-height:128px;
  padding:24px;
  border:1px solid var(--border);
  border-radius:20px;
  background:linear-gradient(145deg,var(--surface),var(--surface2));
  transition:.25s ease;
}
.statCard:hover{transform:translateY(-5px);border-color:var(--borderStrong);box-shadow:var(--glow)}
.statCard strong{display:block;font-size:32px;letter-spacing:-1.5px;margin-bottom:7px}
.statCard span{color:var(--muted);font-size:11px;line-height:1.5}

/* =========================================================
   SECTION HEADERS / MARKETPLACE
   ========================================================= */

.sectionHeader{
  display:flex;
  align-items:flex-end;
  justify-content:space-between;
  gap:25px;
  margin-bottom:32px;
}
.sectionHeader.center{
  flex-direction:column;
  align-items:center;
  text-align:center;
}
.sectionHeader p{max-width:560px;color:var(--muted);font-size:13px}
.marketplaceSection{padding-top:85px}
.deviceTabs{
  display:flex;
  gap:8px;
  overflow-x:auto;
  padding:3px 2px 10px;
  margin-bottom:22px;
  scrollbar-width:none;
}
.deviceTabs::-webkit-scrollbar{display:none}
.deviceTabs button,
.deviceTabs .deviceTab{
  flex:0 0 auto;
  padding:10px 16px;
  border:1px solid var(--border);
  border-radius:999px;
  color:var(--muted);
  background:var(--surface);
  font-size:11px;
  font-weight:800;
  transition:.2s ease;
}
.deviceTabs button:hover,
.deviceTabs .deviceTab:hover{
  color:var(--text);
  border-color:var(--borderStrong);
}
.deviceTabs button.active,
.deviceTabs .active{
  color:#fff;
  border-color:transparent;
  background:linear-gradient(135deg,var(--purple),var(--purple2));
  box-shadow:0 8px 20px rgba(168,85,247,.22);
}

/* =========================================================
   PRODUCT CARDS
   ========================================================= */

.productGrid{
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:18px;
}
.productCard{
  position:relative;
  min-width:0;
  overflow:hidden;
  border:1px solid var(--border);
  border-radius:20px;
  background:linear-gradient(145deg,var(--surface),var(--surface2));
  box-shadow:0 14px 40px rgba(0,0,0,.14);
  transition:transform .25s ease,border-color .25s ease,box-shadow .25s ease;
}
.productCard:hover{
  transform:translateY(-6px);
  border-color:var(--borderStrong);
  box-shadow:var(--glow);
}
.productImage{
  position:relative;
  width:100%;
  aspect-ratio:4/3;
  overflow:hidden;
  background:var(--surface3);
}
.productImage img{
  width:100%;
  height:100%;
  object-fit:cover;
  object-position:center;
  transition:transform .5s ease;
}
.productCard:hover .productImage img{transform:scale(1.06)}
.productImage::after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:linear-gradient(to bottom,transparent 52%,rgba(8,4,13,.35));
}
.conditionBadge{
  position:absolute;
  left:12px;
  top:12px;
  z-index:3;
  padding:6px 9px;
  border-radius:999px;
  color:#d8ffe8;
  background:rgba(16,31,25,.82);
  border:1px solid rgba(110,231,163,.25);
  backdrop-filter:blur(8px);
  font-size:9px;
  font-weight:800;
}
.saveButton{
  position:absolute;
  top:10px;right:10px;
  z-index:4;
  width:38px;height:38px;
  display:grid;place-items:center;
  border-radius:12px;
  color:#fff;
  background:rgba(13,7,19,.65);
  border:1px solid rgba(255,255,255,.14);
  backdrop-filter:blur(10px);
  transition:.2s ease;
}
.saveButton:hover{transform:scale(1.07);background:rgba(168,85,247,.35)}
.saveButton.saved{color:#f472b6;border-color:rgba(236,72,153,.38)}
.productBody{padding:18px}
.productCategory{
  color:var(--purpleLight);
  font-size:9px;
  font-weight:800;
  letter-spacing:1.4px;
  text-transform:uppercase;
}
.productBody h3{margin:7px 0 7px;font-size:17px}
.productDescription{
  min-height:43px;
  color:var(--muted);
  font-size:11px;
  line-height:1.55;
}
.productMeta{
  display:flex;
  justify-content:space-between;
  gap:10px;
  margin-top:13px;
  padding-top:12px;
  border-top:1px solid var(--border);
  color:var(--muted);
  font-size:10px;
}
.productBottom{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:10px;
  margin-top:14px;
}
.productBottom strong{font-size:18px}
.productBottom del{display:block;color:var(--muted);font-size:10px;margin-top:2px}
.score{
  min-width:43px;height:34px;
  display:grid;place-items:center;
  border-radius:10px;
  color:#dfffea;
  background:rgba(110,231,163,.10);
  border:1px solid rgba(110,231,163,.20);
  font-size:11px;
  font-weight:800;
}
.viewProduct{
  width:100%;
  min-height:42px;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
  margin-top:15px;
  border-radius:11px;
  color:var(--text);
  background:var(--surface3);
  border:1px solid var(--border);
  font-size:11px;
  font-weight:800;
  transition:.2s ease;
}
.viewProduct:hover{
  color:#fff;
  border-color:var(--purple);
  background:linear-gradient(135deg,rgba(168,85,247,.20),rgba(124,58,237,.13));
}

/* =========================================================
   PATHWAYS
   ========================================================= */

.pathwaysSection{padding-top:75px}
.pathwayGrid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:16px;
}
.pathwayCard{
  position:relative;
  min-height:190px;
  padding:25px;
  overflow:hidden;
  border:1px solid var(--border);
  border-radius:22px;
  background:linear-gradient(145deg,var(--surface),var(--surface2));
  transition:.25s ease;
}
.pathwayCard::after{
  content:"";
  position:absolute;
  width:120px;height:120px;
  right:-45px;bottom:-55px;
  border-radius:50%;
  background:rgba(168,85,247,.10);
  filter:blur(2px);
}
.pathwayCard:hover{
  transform:translateY(-5px);
  border-color:var(--borderStrong);
  box-shadow:var(--glow);
}
.pathwayCard svg{color:var(--purpleLight);margin-bottom:20px}
.pathwayCard h3{margin-bottom:8px}
.pathwayCard p{color:var(--muted);font-size:12px}

/* =========================================================
   ADVISOR
   ========================================================= */

.advisorSection{padding-top:80px}
.advisorCard{
  display:grid;
  grid-template-columns:auto 1fr;
  gap:24px;
  padding:30px;
  border:1px solid var(--borderStrong);
  border-radius:26px;
  background:
    radial-gradient(circle at 88% 5%,rgba(168,85,247,.18),transparent 28%),
    linear-gradient(145deg,var(--surface2),var(--surface));
  box-shadow:var(--shadow);
}
.advisorIcon{
  width:58px;height:58px;
  display:grid;place-items:center;
  border-radius:17px;
  color:#fff;
  background:linear-gradient(135deg,var(--purple),var(--purple2));
  box-shadow:0 12px 30px rgba(168,85,247,.24);
}
.advisorContent{min-width:0}
.advisorContent h2{font-size:34px;margin-bottom:8px}
.advisorContent > p{color:var(--muted);font-size:13px;max-width:650px}
.advisorResult{
  grid-column:1/-1;
  display:grid;
  grid-template-columns:1fr 1.25fr;
  gap:18px;
  padding:21px;
  border-radius:19px;
  background:rgba(168,85,247,.07);
  border:1px solid var(--border);
}
.advisorResult h4{margin-bottom:9px}
.advisorRecommendation{
  padding:18px;
  border-radius:15px;
  background:var(--surface);
  border:1px solid var(--border);
}
.advisorRecommendation strong{color:var(--purpleLight)}

/* =========================================================
   PARTNERS / REPAIR / RECYCLERS
   ========================================================= */

.partnerSection,.repairSection,.recycleSection,.impactSection,.dashboardSection{padding-top:75px}
.partnerGrid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:18px;
}
.partnerCard{
  overflow:hidden;
  border:1px solid var(--border);
  border-radius:21px;
  background:var(--surface);
  transition:.25s ease;
}
.partnerCard:hover{transform:translateY(-5px);border-color:var(--borderStrong);box-shadow:var(--glow)}
.partnerImage{
  position:relative;
  height:185px;
  overflow:hidden;
  background:var(--surface3);
}
.partnerImage img{
  width:100%;height:100%;
  object-fit:cover;
  object-position:center;
  transition:transform .5s ease;
}
.partnerCard:hover .partnerImage img{transform:scale(1.05)}
.verifiedTag{
  display:inline-flex;
  align-items:center;
  gap:5px;
  color:#dfffea;
  background:rgba(16,31,25,.78);
  border:1px solid rgba(110,231,163,.20);
  border-radius:999px;
  padding:6px 9px;
  font-size:9px;
  font-weight:800;
}
.partnerImage .verifiedTag{
  position:absolute;
  left:12px;top:12px;
}
.partnerBody{padding:20px}
.partnerTitle{font-size:17px;font-weight:800;margin-bottom:7px}
.partnerBody p{color:var(--muted);font-size:11px}
.tagRow{
  display:flex;
  flex-wrap:wrap;
  gap:7px;
  margin:14px 0 17px;
}
.tagRow span{
  padding:6px 8px;
  border-radius:999px;
  color:var(--text2);
  background:var(--surface3);
  border:1px solid var(--border);
  font-size:9px;
  font-weight:700;
}

.repairList{display:flex;flex-direction:column;gap:12px}
.repairRow{
  display:grid;
  grid-template-columns:auto 1fr auto auto;
  align-items:center;
  gap:15px;
  padding:17px;
  border:1px solid var(--border);
  border-radius:18px;
  background:var(--surface);
  transition:.22s ease;
}
.repairRow:hover{border-color:var(--borderStrong);background:var(--surface2)}
.repairLogo{
  width:52px;height:52px;
  display:grid;place-items:center;
  border-radius:15px;
  color:var(--purpleLight);
  background:rgba(168,85,247,.10);
  border:1px solid var(--border);
}
.repairInfo h3{font-size:15px;margin-bottom:4px}
.repairInfo p{color:var(--muted);font-size:10px}
.repairRating{color:var(--warning);font-size:11px;font-weight:800;white-space:nowrap}
.repairInfo + .repairRating{justify-self:end}

.recycleHero{
  display:grid;
  grid-template-columns:1.1fr .9fr;
  align-items:center;
  gap:35px;
  padding:35px;
  border:1px solid var(--borderStrong);
  border-radius:27px;
  background:
    radial-gradient(circle at 80% 20%,rgba(168,85,247,.17),transparent 30%),
    linear-gradient(145deg,var(--surface2),var(--surface));
}
.recycleHero p{color:var(--muted);max-width:610px}
.recycleVisual{
  min-height:270px;
  display:grid;
  place-items:center;
  border-radius:22px;
  border:1px solid var(--border);
  background:radial-gradient(circle,rgba(168,85,247,.12),transparent 62%),var(--surface);
}
.recyclerGrid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:16px;
  margin-top:25px;
}
.recyclerCard{
  padding:21px;
  border:1px solid var(--border);
  border-radius:18px;
  background:var(--surface);
}
.recyclerCard h3{margin:12px 0 6px}
.recyclerCard p{color:var(--muted);font-size:11px}

/* =========================================================
   IMPACT / DASHBOARD
   ========================================================= */

.impactHeader{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:30px;
  margin-bottom:25px;
}
.impactScore{
  min-width:250px;
  padding:28px;
  border-radius:23px;
  border:1px solid var(--borderStrong);
  background:linear-gradient(145deg,#29133f,#160d20);
  box-shadow:var(--glow);
}
.app.light .impactScore{background:linear-gradient(145deg,#f3e5fb,#fff)}
.impactScore strong{display:block;font-size:72px;line-height:1;margin:8px 0}
.progress{
  width:100%;
  height:8px;
  overflow:hidden;
  border-radius:999px;
  background:var(--surface3);
}
.progress > div,
.progressBar{
  height:100%;
  border-radius:inherit;
  background:linear-gradient(90deg,var(--purple2),var(--pink));
}
.impactStats{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:14px;
}
.impactStats > div{
  padding:22px;
  border:1px solid var(--border);
  border-radius:18px;
  background:var(--surface);
}
.impactStats strong{display:block;font-size:26px;margin-bottom:5px}
.impactStats span{color:var(--muted);font-size:10px}

.dashboardGrid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:16px;
}
.dashboardCard{
  min-height:155px;
  padding:23px;
  border:1px solid var(--border);
  border-radius:20px;
  background:var(--surface);
}
.dashboardCard.large{
  grid-column:1/-1;
  min-height:245px;
}
.dashboardTop{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
}
.dashboardScore strong{font-size:62px;line-height:1}
.dashboardCard h3{margin-bottom:8px}
.dashboardCard p{color:var(--muted);font-size:11px}
.activityCard{
  grid-column:1/-1;
  padding:23px;
  border:1px solid var(--border);
  border-radius:20px;
  background:var(--surface);
}
.activityHeader{
  display:flex;
  align-items:center;
  justify-content:space-between;
  margin-bottom:18px;
}
.activityItem{
  display:grid;
  grid-template-columns:40px 1fr auto;
  align-items:center;
  gap:12px;
  padding:14px 0;
  border-top:1px solid var(--border);
}
.activityIcon{
  width:40px;height:40px;
  display:grid;place-items:center;
  border-radius:12px;
  color:var(--purpleLight);
  background:var(--accent-soft);
}
.activityItem p{color:var(--muted);font-size:10px}
.activityItem time{color:var(--muted);font-size:9px}

.finalCTA{
  padding-top:80px;
  padding-bottom:95px;
}
.finalCTA > div{
  position:relative;
  overflow:hidden;
  padding:55px;
  border:1px solid var(--borderStrong);
  border-radius:28px;
  background:
    radial-gradient(circle at 82% 15%,rgba(168,85,247,.24),transparent 31%),
    linear-gradient(135deg,#241033,#11091a);
}
.app.light .finalCTA > div{
  background:linear-gradient(135deg,#f3e5fb,#fff);
}
.finalCTA p{max-width:650px;color:var(--muted);margin:14px 0 24px}
.finalButtons{display:flex;flex-wrap:wrap;gap:10px}

/* =========================================================
   FOOTER
   ========================================================= */

.footer{
  width:min(1240px,92%);
  margin:0 auto;
  padding:55px 0 28px;
  border-top:1px solid var(--border);
}
.footerBrand{display:flex;align-items:center;gap:10px;font-weight:800}
.footerLinks{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:20px;
  margin:25px 0 35px;
}
.footerLinks a{
  color:var(--muted);
  font-size:11px;
  transition:.2s ease;
}
.footerLinks a:hover{color:var(--purpleLight);transform:translateX(3px)}
.copyright{
  padding-top:20px;
  border-top:1px solid var(--border);
  color:var(--muted);
  font-size:10px;
}

/* =========================================================
   PRODUCT POPUP
   ========================================================= */

.modalOverlay{
  position:fixed;
  inset:0;
  z-index:5000;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:18px;
  background:rgba(5,2,9,.74);
  backdrop-filter:blur(13px);
  -webkit-backdrop-filter:blur(13px);
  animation:fadeIn .18s ease;
}
.app.light .modalOverlay{background:rgba(30,18,40,.36)}
.modalBox{
  position:relative;
  width:min(760px,100%);
  max-height:92vh;
  overflow:auto;
  padding:28px;
  border:1px solid var(--borderStrong);
  border-radius:26px;
  background:linear-gradient(145deg,#1c1129,#100a17);
  box-shadow:0 35px 110px rgba(0,0,0,.55),0 0 70px rgba(168,85,247,.12);
  animation:popupIn .28s cubic-bezier(.2,.8,.2,1);
}
.app.light .modalBox{background:linear-gradient(145deg,#fff,#f8f1fc)}
.closeModal{
  position:absolute;
  top:15px;right:15px;
  z-index:10;
  width:38px;height:38px;
  display:grid;place-items:center;
  border:1px solid var(--border);
  border-radius:11px;
  color:var(--text);
  background:var(--surface);
}
.closeModal:hover{border-color:var(--purple);background:var(--surface2)}
.productModal{width:min(920px,100%)}
.modalProductContent{min-width:0}
.modalProductImage{
  width:100%;
  max-height:370px;
  overflow:hidden;
  border-radius:18px;
  margin-bottom:20px;
  background:var(--surface3);
}
.modalProductImage img{
  width:100%;
  height:370px;
  object-fit:cover;
  object-position:center;
}
.modalDescription{color:var(--muted);font-size:12px;line-height:1.7;margin:10px 0}
.priceLine{
  display:flex;
  align-items:baseline;
  gap:10px;
  margin:12px 0 20px;
}
.priceLine strong{font-size:30px}
.priceLine del{color:var(--muted);font-size:12px}
.detailGrid{
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
  margin:18px 0;
}
.detailGrid > div{
  padding:13px;
  border-radius:13px;
  border:1px solid var(--border);
  background:var(--surface);
}
.detailGrid span{display:block;color:var(--muted);font-size:9px;margin-bottom:4px}
.detailGrid strong{font-size:12px}
.sellerBox{
  display:flex;
  align-items:center;
  gap:12px;
  padding:15px;
  margin:18px 0;
  border-radius:15px;
  border:1px solid var(--border);
  background:var(--surface);
}
.sellerAvatar{
  width:42px;height:42px;
  display:grid;place-items:center;
  border-radius:50%;
  color:#fff;
  background:linear-gradient(135deg,var(--purple),var(--pink));
  font-weight:800;
}
.modalButtons{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}
.modalButtons > *{flex:1;min-width:150px}

/* =========================================================
   FORM MODALS
   ========================================================= */

.formModal{width:min(720px,100%)}
.modalEyebrow{
  color:var(--purpleLight);
  font-size:10px;
  font-weight:800;
  letter-spacing:1.8px;
  margin-bottom:8px;
}
.formIntro{
  color:var(--muted);
  font-size:12px;
  margin:6px 0 22px;
}
.formGrid{
  display:grid;
  grid-template-columns:repeat(2,minmax(0,1fr));
  gap:15px;
}
.field{
  display:flex;
  flex-direction:column;
  gap:7px;
}
.field.fullField{grid-column:1/-1}
.field > span{
  color:var(--text2);
  font-size:10px;
  font-weight:800;
}
.field input,
.field select,
.field textarea,
.searchLarge input{
  width:100%;
  min-height:46px;
  padding:0 13px;
  border:1px solid var(--border);
  border-radius:11px;
  outline:none;
  color:var(--text);
  background:var(--surface);
  transition:.2s ease;
}
.field textarea{padding:13px;min-height:110px;resize:vertical}
.field input::placeholder,.field textarea::placeholder{color:var(--muted)}
.field input:focus,.field select:focus,.field textarea:focus,.searchLarge input:focus{
  border-color:var(--purple);
  box-shadow:0 0 0 4px rgba(168,85,247,.09);
}
.field select{
  appearance:none;
  -webkit-appearance:none;
  padding-right:40px;
}
.selectWrapper,.dateWrapper{position:relative}
.selectWrapper svg,.dateWrapper svg{
  position:absolute;
  right:13px;
  top:50%;
  transform:translateY(-50%);
  color:var(--muted);
  pointer-events:none;
}
.dateWrapper input{padding-right:42px}
.uploadBox{
  min-height:180px;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
  padding:24px;
  border:1px dashed var(--borderStrong);
  border-radius:18px;
  color:var(--muted);
  background:radial-gradient(circle,rgba(168,85,247,.09),transparent 65%);
}
.uploadBox:hover{border-color:var(--purple);background:radial-gradient(circle,rgba(168,85,247,.14),transparent 68%)}
.orderSummary,.bookingDetails,.swapPreview{
  margin-top:18px;
  padding:17px;
  border-radius:16px;
  border:1px solid var(--border);
  background:var(--surface);
}
.orderSummary strong,.bookingDetails strong{color:var(--purpleLight)}
.finalButtons,.modalButtons{margin-top:20px}

/* Search modal */
.searchLarge{position:relative;margin-bottom:12px}
.searchLarge input{min-height:52px;padding-left:17px;font-size:14px}
.searchSuggestions{
  display:flex;
  flex-direction:column;
  gap:7px;
  margin-top:13px;
}
.searchSuggestions button{
  padding:13px 14px;
  text-align:left;
  border-radius:12px;
  color:var(--text2);
  background:var(--surface);
  border:1px solid var(--border);
}
.searchSuggestions button:hover{border-color:var(--borderStrong);background:var(--surface2)}

/* =========================================================
   TOAST
   ========================================================= */

.toastContainer,.toast-container{
  position:fixed;
  right:22px;
  bottom:22px;
  z-index:8000;
  display:flex;
  flex-direction:column;
  gap:9px;
}
.toast{
  min-width:280px;
  max-width:380px;
  padding:14px 16px;
  border:1px solid var(--borderStrong);
  border-radius:14px;
  color:var(--text);
  background:var(--surface2);
  box-shadow:var(--shadow);
  animation:toastIn .25s ease;
}

/* =========================================================
   ADMIN
   ========================================================= */

.adminHeader{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap:20px;
  margin-bottom:24px;
}
.adminStats{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:10px;
  margin-bottom:20px;
}
.adminStats > div{
  padding:18px;
  border:1px solid var(--border);
  border-radius:15px;
  background:var(--surface);
}
.adminStats span{display:block;color:var(--muted);font-size:9px;font-weight:800;letter-spacing:1px}
.adminStats strong{display:block;margin-top:7px;font-size:25px}
.adminTable{
  overflow:hidden;
  border:1px solid var(--border);
  border-radius:17px;
}
.adminTableHeader,.adminTableRow{
  display:grid;
  grid-template-columns:2fr 1fr 1fr auto;
  gap:15px;
  align-items:center;
  padding:15px;
}
.adminTableHeader{
  color:var(--muted);
  background:var(--surface2);
  font-size:9px;
  font-weight:800;
  letter-spacing:1px;
  text-transform:uppercase;
}
.adminTableRow{
  border-top:1px solid var(--border);
  font-size:11px;
}
.adminTableRow button{
  padding:8px 11px;
  border-radius:9px;
  color:var(--purpleLight);
  background:rgba(168,85,247,.09);
  font-size:10px;
  font-weight:800;
}
.adminTableRow button:hover{background:rgba(168,85,247,.17)}
.statusGood{color:var(--success);font-weight:800}
.statusPending{color:var(--warning);font-weight:800}

/* =========================================================
   LEGACY / OPTIONAL COMPATIBILITY CLASSES
   ========================================================= */

.dashboardTop > *{min-width:0}
.large{grid-column:1/-1}
.center{text-align:center}
.searchLarge svg{color:var(--muted)}
.conditionBadge + .saveButton{z-index:5}

/* =========================================================
   ANIMATIONS
   ========================================================= */

@keyframes fadeIn{
  from{opacity:0}
  to{opacity:1}
}
@keyframes popupIn{
  from{opacity:0;transform:translateY(18px) scale(.975)}
  to{opacity:1;transform:translateY(0) scale(1)}
}
@keyframes toastIn{
  from{opacity:0;transform:translateX(25px)}
  to{opacity:1;transform:translateX(0)}
}

/* =========================================================
   RESPONSIVE
   ========================================================= */

@media (max-width:1180px){
  .navInner{width:96%;gap:10px}
  .desktopNav{gap:0}
  .desktopNav button{padding:9px 7px;font-size:10px}
  .profileName{display:none}
  .productGrid{grid-template-columns:repeat(3,minmax(0,1fr))}
  .statsSection{grid-template-columns:repeat(2,1fr)}
  .pathwayGrid,.partnerGrid,.recyclerGrid{grid-template-columns:repeat(2,1fr)}
}

@media (max-width:900px){
  :root{--nav:70px}
  .desktopNav{display:none}
  .mobileMenuButton{display:grid}
  .mobileMenu{
    position:absolute;
    top:calc(var(--nav) + 9px);
    left:14px;
    right:14px;
    padding:10px;
    display:flex;
    flex-direction:column;
    border:1px solid var(--border);
    border-radius:18px;
    background:rgba(22,13,32,.97);
    backdrop-filter:blur(20px);
    box-shadow:var(--shadow);
    animation:popupIn .2s ease;
  }
  .app.light .mobileMenu{background:rgba(255,255,255,.98)}
  .mobileMenu button{text-align:left;width:100%;padding:13px}
  .hero{
    min-height:auto;
    grid-template-columns:1fr;
    padding-top:65px;
    text-align:center;
  }
  .heroContent{margin:auto}
  .heroButtons,.trustRow{justify-content:center}
  .orbitArea{width:min(500px,92vw)}
  .advisorCard{grid-template-columns:1fr}
  .advisorResult{grid-template-columns:1fr}
  .recycleHero{grid-template-columns:1fr}
  .impactHeader{align-items:flex-start;flex-direction:column}
  .impactScore{width:100%}
  .impactStats{grid-template-columns:repeat(2,1fr)}
  .footerLinks{grid-template-columns:repeat(2,1fr)}
}

@media (max-width:680px){
  .section{width:92%;padding:68px 0}
  h1{font-size:43px}
  h2{font-size:34px}
  .brand{font-size:16px}
  .brandIcon{width:38px;height:38px}
  .listButton{display:none}
  .navActions{margin-left:auto}
  .iconButton{width:38px;height:38px}
  .avatar{width:38px;height:38px}
  .heroText{font-size:14px}
  .orbitArea{width:min(390px,94vw)}
  .orbitNode{width:68px;height:68px;border-radius:19px}
  .nodeBuy{margin-left:-34px}
  .nodeDonate{margin-left:-34px}
  .orbitCenter{width:120px;height:120px}
  .orbitCenter strong{font-size:15px}
  .statsSection{width:92%;grid-template-columns:1fr 1fr}
  .productGrid{grid-template-columns:1fr 1fr}
  .pathwayGrid,.partnerGrid,.recyclerGrid{grid-template-columns:1fr}
  .sectionHeader{align-items:flex-start;flex-direction:column}
  .repairRow{grid-template-columns:auto 1fr}
  .repairRating{grid-column:2;justify-self:start}
  .repairRow .outlineButton{grid-column:2;justify-self:start}
  .formGrid{grid-template-columns:1fr}
  .field.fullField{grid-column:auto}
  .detailGrid{grid-template-columns:1fr 1fr}
  .modalProductImage img{height:280px}
  .modalBox{padding:22px}
  .adminStats{grid-template-columns:1fr 1fr}
  .adminTable{overflow-x:auto}
  .adminTableHeader,.adminTableRow{min-width:620px}
  .dashboardGrid{grid-template-columns:1fr}
  .dashboardCard.large,.activityCard{grid-column:auto}
  .dashboardTop{align-items:flex-start;flex-direction:column}
  .finalCTA > div{padding:35px 24px}
  .footer{width:92%}
}

@media (max-width:460px){
  .section{width:93%}
  .statsSection{grid-template-columns:1fr}
  .productGrid{grid-template-columns:1fr}
  .heroButtons .primaryButton,.heroButtons .secondaryButton,
  .finalButtons .primaryButton,.finalButtons .secondaryButton{width:100%}
  .orbitArea{width:340px;max-width:100%}
  .orbitNode{width:61px;height:61px}
  .nodeBuy,.nodeDonate{margin-left:-30.5px}
  .orbitCenter{width:104px;height:104px}
  .orbitCenter strong{font-size:13px}
  .orbitCenter span{font-size:8px}
  .impactStats{grid-template-columns:1fr}
  .footerLinks{grid-template-columns:1fr}
  .detailGrid{grid-template-columns:1fr}
  .modalButtons{flex-direction:column}
  .modalButtons > *{width:100%;min-width:0}
  .toast{min-width:0;max-width:none;width:calc(100vw - 40px)}
  .toastContainer,.toast-container{left:20px;right:20px}
}

/* Hide custom cursor leftovers if another script adds them */
.cursor-dot,.cursor-ring{pointer-events:none}

/* Reduced motion */
@media (prefers-reduced-motion:reduce){
  *,*::before,*::after{
    scroll-behavior:auto!important;
    animation-duration:.01ms!important;
    animation-iteration-count:1!important;
    transition-duration:.01ms!important;
  }
}
'''

out=Path("/mnt/data/CircularHub-styles-fixed.css")
out.write_text(css,encoding="utf-8")

print(f"Created: {out}")
print(f"Lines: {len(css.splitlines())}")
print("This replacement CSS is matched to the camelCase class names used by the current App.tsx, including product cards, save buttons, product popups, form modals, admin UI, orbit, dashboard, repair/recycle/partner sections, and dark/light mode.")
