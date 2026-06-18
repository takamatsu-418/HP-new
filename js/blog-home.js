/**
 * Loads blog-posts.json and renders the home page.
 * Latest post → featured section; remaining posts → article grid.
 */
(function () {
    const latestSection = document.getElementById('latest-article');
    const articlesGrid = document.getElementById('articles-grid');

    if (!latestSection || !articlesGrid) return;

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function renderLatest(post) {
        latestSection.innerHTML = `
            <div class="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_30px_-4px_rgba(0,0,0,0.06)] transition-all group relative cursor-pointer">
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    <div class="lg:col-span-5 aspect-[16/10] bg-slate-100 rounded-xl overflow-hidden relative shadow-sm">
                        <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-in-out">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
                        <div class="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md z-10">最新記事</div>
                    </div>
                    <div class="lg:col-span-7 flex flex-col justify-center">
                        <span class="text-[11px] font-bold tracking-widest text-brand-green uppercase mb-2 block">LATEST ARTICLE</span>
                        <h2 class="text-xl md:text-2xl font-bold text-slate-900 leading-snug group-hover:text-brand-green transition-colors duration-300 mb-4">
                            <a href="${escapeHtml(post.url)}" class="after:absolute after:inset-0 after:z-20">${escapeHtml(post.title)}</a>
                        </h2>
                        <p class="text-slate-500 text-sm leading-relaxed mb-6 line-clamp-3">${escapeHtml(post.excerpt)}</p>
                    </div>
                </div>
            </div>`;
    }

    function renderArticleCard(post) {
        return `
            <article class="relative bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-[0_4px_15px_-4px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_25px_-5px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-500 ease-out group flex flex-col">
                <div class="aspect-[16/10] bg-slate-900 overflow-hidden flex items-center justify-center relative">
                    <img src="${escapeHtml(post.image)}" alt="${escapeHtml(post.imageAlt || post.title)}" class="w-full h-full object-cover">
                </div>
                <div class="p-6 flex flex-col flex-grow">
                    <div class="flex items-center gap-3 mb-3">
                        <span class="text-[10px] font-bold tracking-widest text-brand-green uppercase">${escapeHtml(post.category)}</span>
                    </div>
                    <h4 class="font-bold text-slate-900 text-base leading-snug line-clamp-3 group-hover:text-brand-green transition-colors duration-300 mb-6">
                        <a href="${escapeHtml(post.url)}" class="after:absolute after:inset-0 after:z-30">${escapeHtml(post.title)}</a>
                    </h4>
                    <div class="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between text-slate-500">
                        <div class="flex items-center gap-4 text-xs">
                            <div class="flex items-center gap-1.5">
                                <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                </svg>
                                <span>${escapeHtml(post.date)}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-1.5 text-blue-600 text-xs font-medium group-hover:text-blue-700 transition-colors">
                            続きを読む
                            <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                        </div>
                    </div>
                </div>
            </article>`;
    }

    function renderPosts(posts) {
        if (!posts.length) {
            latestSection.innerHTML = '<p class="text-slate-500 text-center py-12">記事がありません。</p>';
            return;
        }
        renderLatest(posts[0]);
        articlesGrid.innerHTML = posts.slice(1).map(renderArticleCard).join('');
    }

    var embedded = document.getElementById('blog-posts-data');
    if (embedded && embedded.textContent.trim()) {
        try {
            renderPosts(JSON.parse(embedded.textContent));
            return;
        } catch (e) { /* fall through to fetch */ }
    }

    fetch('blog-posts.json')
        .then(function (res) {
            if (!res.ok) throw new Error('blog-posts.json not found');
            return res.json();
        })
        .then(renderPosts)
        .catch(function () {
            latestSection.innerHTML = '<p class="text-slate-500 text-center py-12">記事の読み込みに失敗しました。update-blog-home.bat を実行してください。</p>';
        });
})();
