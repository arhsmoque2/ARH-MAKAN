const surfaces = {
  customer: {
    url: '../customer/index.html?table=T05',
    title: 'Customer Dine-In Menu (Mobile)',
    device: 'mobile'
  },
  kds: {
    url: '../kds/index.html',
    title: 'Kitchen Display System (Landscape)',
    device: 'tablet'
  },
  pos: {
    url: '../pos/index.html',
    title: 'Counter POS Terminal (Desktop)',
    device: 'desktop'
  },
  admin: {
    url: '../admin/index.html',
    title: 'Store Owner & Operations Console',
    device: 'desktop'
  }
};

const iframe = document.getElementById('showroom-iframe');
const frame = document.getElementById('device-frame');
const label = document.getElementById('preview-title-label');
const openLink = document.getElementById('preview-open-link');

function switchSurface(surfaceKey) {
  const cfg = surfaces[surfaceKey];
  if (!cfg) return;

  // Update tabs
  document.querySelectorAll('.surface-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.surface === surfaceKey);
  });

  // Update device frame class
  frame.className = `device-frame ${cfg.device}`;

  // Update iframe source
  iframe.src = cfg.url;

  // Update header label and external link
  if (label) label.innerText = cfg.title;
  if (openLink) openLink.href = cfg.url;
}

document.querySelectorAll('.surface-tab-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const key = e.currentTarget.dataset.surface;
    switchSurface(key);
  });
});

// Default to customer
switchSurface('customer');
