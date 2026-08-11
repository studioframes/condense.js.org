// blog.js - Vanilla JS Blog Engine & Full Article Reader (Strict Security, No innerHTML, No Inline Event Handlers, No Inline Styles)

(function () {
  "use strict";

  var BLOG_POSTS = [
    {
      id: "how-condense-keeps-static-assets-fast",
      title:
        "How Condense keeps static assets fast in a serverless world",
      date: "Wednesday, August 11th 2026",
      category: "Performance",
      file: "./blogs/how-condense-keeps-static-assets-fast.md",
      excerpt:
        "Serverless deployment has changed the way teams think about performance. Instead of a single long-lived server handling requests, services are often spread across ephemeral runtimes, autoscaled containers, and edge-like environments.",
    },
    {
      id: "smaller-assets-bigger-product-impact",
      title:
        "Smaller assets, bigger product impact",
      date: "Wednesday, August 9th 2026",
      category: "Performance",
      file: "./blogs/smaller-assets-bigger-product-impact.md",
      excerpt:
        "The size of the images, media, CSS, and JavaScript that reach the browser shapes the user experience in a very direct way. It affects page speed, mobile performance, data usage, and even how users judge the quality of an app.",
    },
    {
      id: "the-case-for-stateless-media-processing-in-modern-apis",
      title:
        "The case for stateless media processing in modern APIs",
      date: "Wednesday, August 9th 2026",
      category: "Performance",
      file: "./blogs/the-case-for-stateless-media-processing-in-modern-apis.md",
      excerpt:
        "Modern APIs are expected to do more than move data around. They are expected to accept uploads, transform content, and return optimized payloads quickly, reliably, and without creating operational surprises.",
    },
    {
      id: "three-optimization-modes-one-practical-strategy",
      title:
        "Three optimization modes, one practical strategy",
      date: "Wednesday, August 7th 2026",
      category: "Performance",
      file: "./blogs/three-optimization-modes-one-practical-strategy.md",
      excerpt:
        "Not every asset deserves the same level of compression. A high-fidelity preview image for a design tool is not the same as a small social thumbnail or a heavily compressed background asset for a landing page.",
    },
    {
      id: "in-memory-vs-disk-io",
      title:
        "Why In-Memory Processing Outperforms Disk I/O in Serverless Environments",
      date: "Wednesday, August 5th 2026",
      category: "Performance",
      file: "./blogs/in-memory-vs-disk-io.md",
      excerpt:
        "In ephemeral and serverless runtimes, file system access introduces latency bottlenecks, concurrency locks, and storage limit errors. Let's look at why Condense processes everything in-memory.",
    },
    {
      id: "performance-tuning-media-streams",
      title: "Performance Tuning Media Streams in Condense",
      date: "Monday, August 3rd 2026",
      category: "Performance",
      file: "./blogs/performance-tuning-media-streams.md",
      excerpt:
        "Audio and video files present unique challenges due to their large sizes. In this guide, we dive into how Condense handles video streaming with zero-copy PassThrough streams.",
    },
    {
      id: "a-new-look",
      title:
        "A New Look for Condense: Introducing the Refreshed Logo and Website",
      date: "Saturday, August 1st 2026",
      category: "Brand",
      file: "./blogs/a-new-look.md",
      excerpt:
        "The bright red branding that has represented the project since its early development has been replaced with a minimalist black-and-white visual system.",
    },
    {
      id: "welcome-to-the-condense-blog",
      title: "Welcome to the Condense Blog: Sharing Stories Behind the Project",
      date: "Saturday, August 1st 2026",
      category: "Guide",
      file: "./blogs/welcome-to-the-condense-blog.md",
      excerpt:
        "Welcome to the Condense Blog! The Condense Blog is where we share the stories behind the project—not every commit, but the updates that matter.",
    },
  ];

  var currentCategory = "All";
  var searchQuery = "";

  // Safe inline formatter creating DOM nodes without innerHTML
  function formatInlineToNodes(text) {
    var container = document.createElement("span");
    if (!text) return container;

    // Pattern matching:
    // 1 & 2: ![alt](url) -> standard image
    // 3 & 4: [!alt](url) -> custom/typo image syntax
    // 5 & 6: [text](url) -> link
    // 7: `code`
    // 8: **bold**
    // 9: *italic*
    // 10: ~~strikethrough~~
    var pattern =
      /!\[([^\]]*)\]\(([^)]+)\)|\[!([^\]]*)\]\(([^)]+)\)|\[([^\]]+)\]\(([^)]+)\)|`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*|~~([^~]+)~~/g;
    var lastIndex = 0;
    var match;

    while ((match = pattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        container.appendChild(
          document.createTextNode(text.slice(lastIndex, match.index)),
        );
      }

      if (match[1] !== undefined && match[2] !== undefined) {
        var img = document.createElement("img");
        img.src = match[2];
        img.alt = match[1];
        img.className = "article-img";
        container.appendChild(img);
      } else if (match[3] !== undefined && match[4] !== undefined) {
        var img2 = document.createElement("img");
        img2.src = match[4];
        img2.alt = match[3];
        img2.className = "article-img";
        container.appendChild(img2);
      } else if (match[5] !== undefined && match[6] !== undefined) {
        var a = document.createElement("a");
        a.href = match[6];
        a.textContent = match[5];
        a.className = "article-link";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        container.appendChild(a);
      } else if (match[7] !== undefined) {
        var code = document.createElement("code");
        code.className = "inline-code";
        code.textContent = match[7];
        container.appendChild(code);
      } else if (match[8] !== undefined) {
        var strong = document.createElement("strong");
        strong.textContent = match[8];
        container.appendChild(strong);
      } else if (match[9] !== undefined) {
        var em = document.createElement("em");
        em.textContent = match[9];
        container.appendChild(em);
      } else if (match[10] !== undefined) {
        var del = document.createElement("del");
        del.textContent = match[10];
        container.appendChild(del);
      }

      lastIndex = pattern.lastIndex;
    }

    if (lastIndex < text.length) {
      container.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    return container;
  }

  function copyTextToClipboard(text, iconEl) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(function () {
          if (iconEl) iconEl.className = "bi bi-check2";
          setTimeout(function () {
            if (iconEl) iconEl.className = "bi bi-copy";
          }, 2000);
        })
        .catch(function () {
          // Fallback
        });
    } else {
      var textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.className = "hidden";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand("copy");
        if (iconEl) iconEl.className = "bi bi-check2";
        setTimeout(function () {
          if (iconEl) iconEl.className = "bi bi-copy";
        }, 2000);
      } catch (err) {}
      document.body.removeChild(textarea);
    }
  }

  function parseTableCells(line) {
    var clean = line.trim();
    if (clean.startsWith("|")) clean = clean.slice(1);
    if (clean.endsWith("|")) clean = clean.slice(0, -1);

    var protectedLine = clean.replace(/\\\|/g, "\uE000");
    var parts = protectedLine.split("|");
    return parts.map(function (part) {
      return part.replace(/\uE000/g, "|");
    });
  }

  function parseMarkdownToDOM(md) {
    var wrapper = document.createElement("div");
    if (!md) return wrapper;

    var lines = md.replace(/\r\n/g, "\n").split("\n");
    var inCodeBlock = false;
    var codeLang = "";
    var codeLines = [];
    var listItems = [];
    var paragraphLines = [];
    var tableLines = [];
    var headingCount = 0;

    function flushParagraph() {
      if (paragraphLines.length) {
        var p = document.createElement("p");
        p.className = "article-paragraph";
        p.appendChild(formatInlineToNodes(paragraphLines.join(" ")));
        wrapper.appendChild(p);
        paragraphLines = [];
      }
    }

    function flushList() {
      if (listItems.length) {
        var ul = document.createElement("ul");
        ul.className = "article-ul";
        listItems.forEach(function (itemText) {
          var li = document.createElement("li");
          li.className = "article-li";
          li.appendChild(formatInlineToNodes(itemText));
          ul.appendChild(li);
        });
        wrapper.appendChild(ul);
        listItems = [];
      }
    }

    function flushCode() {
      if (codeLines.length) {
        var rawCode = codeLines.join("\n");

        var terminalBlock = document.createElement("div");
        terminalBlock.className = "terminal-block";

        var header = document.createElement("div");
        header.className = "terminal-header";

        var titleSpan = document.createElement("span");
        titleSpan.className = "terminal-title";
        var terminalIcon = document.createElement("i");
        terminalIcon.className = "bi bi-terminal";
        titleSpan.appendChild(terminalIcon);
        titleSpan.appendChild(document.createTextNode(" Terminal"));

        var copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "terminal-copy-btn";
        copyBtn.title = "Copy code";
        var copyIcon = document.createElement("i");
        copyIcon.className = "bi bi-copy";
        copyBtn.appendChild(copyIcon);

        copyBtn.addEventListener("click", function () {
          copyTextToClipboard(rawCode, copyIcon);
        });

        header.appendChild(titleSpan);
        header.appendChild(copyBtn);

        var pre = document.createElement("pre");
        var code = document.createElement("code");
        if (codeLang) {
          code.className = "language-" + codeLang;
        }
        code.textContent = rawCode;
        pre.appendChild(code);

        terminalBlock.appendChild(header);
        terminalBlock.appendChild(pre);

        wrapper.appendChild(terminalBlock);

        codeLines = [];
        codeLang = "";
      }
    }

    function flushTable() {
      if (!tableLines.length) return;

      var sepIndex = -1;
      for (var i = 1; i < tableLines.length; i++) {
        var rawCells = parseTableCells(tableLines[i]);
        if (
          rawCells.length > 0 &&
          rawCells.every(function (c) {
            return /^\s*:?-+:?\s*$/.test(c);
          })
        ) {
          sepIndex = i;
          break;
        }
      }

      if (sepIndex === -1) {
        tableLines.forEach(function (tl) {
          paragraphLines.push(tl);
        });
        flushParagraph();
        tableLines = [];
        return;
      }

      var sepCells = parseTableCells(tableLines[sepIndex]);
      var alignments = sepCells.map(function (cell) {
        var c = cell.trim();
        var leftColon = c.startsWith(":");
        var rightColon = c.endsWith(":");
        if (leftColon && rightColon) return "center";
        if (rightColon) return "right";
        if (leftColon) return "left";
        return "";
      });

      var tableCard = document.createElement("div");
      tableCard.className = "table-card";

      var tableWrapper = document.createElement("div");
      tableWrapper.className = "table-wrapper";

      var table = document.createElement("table");
      table.className = "benchmark-table";

      var thead = document.createElement("thead");
      for (var h = 0; h < sepIndex; h++) {
        var tr = document.createElement("tr");
        var hCells = parseTableCells(tableLines[h]);
        hCells.forEach(function (cellText, colIdx) {
          var th = document.createElement("th");
          var align = alignments[colIdx] || "";
          if (align) {
            th.className = "text-" + align;
          }
          th.appendChild(formatInlineToNodes(cellText.trim()));
          tr.appendChild(th);
        });
        thead.appendChild(tr);
      }
      table.appendChild(thead);

      if (sepIndex + 1 < tableLines.length) {
        var tbody = document.createElement("tbody");
        for (var b = sepIndex + 1; b < tableLines.length; b++) {
          var tr = document.createElement("tr");
          var bCells = parseTableCells(tableLines[b]);
          bCells.forEach(function (cellText, colIdx) {
            var td = document.createElement("td");
            var align = alignments[colIdx] || "";
            if (align) {
              td.className = "text-" + align;
            }
            td.appendChild(formatInlineToNodes(cellText.trim()));
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        }
        table.appendChild(tbody);
      }

      tableWrapper.appendChild(table);
      tableCard.appendChild(tableWrapper);
      wrapper.appendChild(tableCard);

      tableLines = [];
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        flushTable();
        flushParagraph();
        flushList();
        if (inCodeBlock) {
          flushCode();
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeLang = trimmed.slice(3).trim();
        }
        continue;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        continue;
      }

      if (/^#{1,6}\s+/.test(trimmed)) {
        flushTable();
        flushParagraph();
        flushList();
        var level = trimmed.match(/^#+/)[0].length;
        var text = trimmed.replace(/^#{1,6}\s+/, "");
        headingCount++;
        var headingId = "heading-" + headingCount;

        var tag = "h" + Math.min(level, 6);
        var h = document.createElement(tag);
        h.id = headingId;
        h.className = "article-heading h" + level;
        h.appendChild(formatInlineToNodes(text));

        wrapper.appendChild(h);
        continue;
      }

      if (/^>\s?/.test(trimmed)) {
        flushTable();
        flushParagraph();
        flushList();
        var bq = document.createElement("blockquote");
        bq.className = "article-blockquote";
        bq.appendChild(formatInlineToNodes(trimmed.replace(/^>\s?/, "")));
        wrapper.appendChild(bq);
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        flushTable();
        flushParagraph();
        listItems.push(trimmed.replace(/^[-*]\s+/, ""));
        continue;
      }

      if (!trimmed) {
        flushTable();
        flushParagraph();
        flushList();
        continue;
      }

      if (trimmed.indexOf("|") !== -1) {
        if (tableLines.length === 0) {
          flushParagraph();
          flushList();
        }
        tableLines.push(trimmed);
        continue;
      }

      flushTable();
      paragraphLines.push(trimmed);
    }

    flushTable();
    flushParagraph();
    flushList();
    if (inCodeBlock) flushCode();

    return wrapper;
  }

  function generateToc(containerEl, tocListEl) {
    if (!containerEl || !tocListEl) return;
    tocListEl.textContent = "";

    var headings = containerEl.querySelectorAll("h1, h2, h3");

    if (headings.length === 0) {
      var liMuted = document.createElement("li");
      liMuted.className = "toc-item muted";
      liMuted.textContent = "Overview";
      tocListEl.appendChild(liMuted);
      return;
    }

    headings.forEach(function (heading, index) {
      if (!heading.id) {
        heading.id = "heading-toc-" + index;
      }
      var li = document.createElement("li");
      li.className = "toc-item";

      var a = document.createElement("a");
      a.href = "#" + heading.id;
      a.className = "toc-link";
      a.textContent = heading.textContent;
      a.addEventListener("click", function (e) {
        e.preventDefault();
        heading.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      li.appendChild(a);
      tocListEl.appendChild(li);
    });
  }

  function renderBlogGrid() {
    var gridEl = document.getElementById("blogsGrid");
    if (!gridEl) return;

    gridEl.textContent = "";

    var filtered = BLOG_POSTS.filter(function (post) {
      var matchesCategory =
        currentCategory === "All" ||
        post.category.toLowerCase() === currentCategory.toLowerCase();
      var q = searchQuery.toLowerCase().trim();
      var matchesSearch =
        !q ||
        post.title.toLowerCase().indexOf(q) !== -1 ||
        post.excerpt.toLowerCase().indexOf(q) !== -1 ||
        post.category.toLowerCase().indexOf(q) !== -1;

      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      var noFoundDiv = document.createElement("div");
      noFoundDiv.className = "no-blogs-found";
      var p = document.createElement("p");
      p.textContent = "No blog posts found matching your criteria.";
      noFoundDiv.appendChild(p);
      gridEl.appendChild(noFoundDiv);
      return;
    }

    filtered.forEach(function (post) {
      var article = document.createElement("article");
      article.className = "blog-card";
      article.setAttribute("data-post-id", post.id);

      var topDiv = document.createElement("div");
      topDiv.className = "blog-card-top";

      var metaLeft = document.createElement("div");
      metaLeft.className = "blog-meta-left";

      var dateSpan = document.createElement("span");
      dateSpan.className = "blog-date";
      dateSpan.textContent = post.date;

      var catSpan = document.createElement("span");
      catSpan.className =
        "blog-category-badge category-" + post.category.toLowerCase();
      catSpan.textContent = post.category;

      metaLeft.appendChild(dateSpan);
      metaLeft.appendChild(catSpan);
      topDiv.appendChild(metaLeft);

      var titleH3 = document.createElement("h3");
      titleH3.className = "blog-card-title";
      titleH3.textContent = post.title;

      var excerptP = document.createElement("p");
      excerptP.className = "blog-card-excerpt";
      excerptP.textContent = post.excerpt;

      var footerDiv = document.createElement("div");
      footerDiv.className = "blog-card-footer";

      var readMoreBtn = document.createElement("button");
      readMoreBtn.type = "button";
      readMoreBtn.className = "btn-read-more";
      readMoreBtn.textContent = "Read More";
      readMoreBtn.addEventListener("click", function () {
        window.openArticle(post.id);
      });

      footerDiv.appendChild(readMoreBtn);

      article.appendChild(topDiv);
      article.appendChild(titleH3);
      article.appendChild(excerptP);
      article.appendChild(footerDiv);

      gridEl.appendChild(article);
    });
  }

  window.openArticle = function (postId) {
    var post = BLOG_POSTS.find(function (p) {
      return p.id === postId;
    });
    if (!post) return;

    var blogListView = document.getElementById("blogListView");
    var blogPostView = document.getElementById("blogPostView");
    var postDetailDate = document.getElementById("postDetailDate");
    var postDetailCategory = document.getElementById("postDetailCategory");
    var postDetailTitle = document.getElementById("postDetailTitle");
    var postDetailContent = document.getElementById("postDetailContent");
    var postTocList = document.getElementById("postTocList");

    if (!blogListView || !blogPostView) return;

    if (postDetailDate) postDetailDate.textContent = post.date;
    if (postDetailCategory) {
      postDetailCategory.textContent = post.category;
      postDetailCategory.className =
        "blog-category-badge category-" + post.category.toLowerCase();
    }
    if (postDetailTitle) postDetailTitle.textContent = post.title;

    if (postDetailContent) {
      postDetailContent.textContent = "";
      var loadingP = document.createElement("p");
      loadingP.className = "docs-loading";
      loadingP.textContent = "Loading article content...";
      postDetailContent.appendChild(loadingP);
    }

    blogListView.classList.add("hidden");
    blogPostView.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.location.hash = post.id;

    var primaryPath = "/blogs/" + post.id + ".md";
    var fallbackPath = post.file || "/blogs/" + post.id + ".md";

    fetch(primaryPath)
      .then(function (res) {
        if (!res.ok) return fetch(fallbackPath);
        return res;
      })
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load markdown article");
        return res.text();
      })
      .then(function (md) {
        if (postDetailContent) {
          postDetailContent.textContent = "";
          var domNodes = parseMarkdownToDOM(md);
          postDetailContent.appendChild(domNodes);
          generateToc(postDetailContent, postTocList);
        }
      })
      .catch(function () {
        if (postDetailContent) {
          postDetailContent.textContent = "";
          var fallbackDiv = document.createElement("div");
          fallbackDiv.className = "article-fallback-content";

          var h1 = document.createElement("h1");
          h1.textContent = post.title;

          var metaP = document.createElement("p");
          metaP.className = "article-meta-info";
          metaP.textContent = post.date + " • " + post.category;

          var excerptP = document.createElement("p");
          excerptP.textContent = post.excerpt;

          fallbackDiv.appendChild(h1);
          fallbackDiv.appendChild(metaP);
          fallbackDiv.appendChild(excerptP);

          postDetailContent.appendChild(fallbackDiv);
        }
      });
  };

  window.showBlogList = function () {
    var blogListView = document.getElementById("blogListView");
    var blogPostView = document.getElementById("blogPostView");

    if (blogListView && blogPostView) {
      blogPostView.classList.add("hidden");
      blogListView.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
      if (window.location.hash) {
        history.pushState(
          "",
          document.title,
          window.location.pathname + window.location.search,
        );
      }
    }
  };

  function initSandbox() {
    var textarea = document.getElementById("sandboxTextarea");
    var preview = document.getElementById("sandboxPreview");
    if (!textarea || !preview) return;

    function updatePreview() {
      preview.textContent = "";
      preview.appendChild(parseMarkdownToDOM(textarea.value));
    }

    textarea.addEventListener("input", updatePreview);
    updatePreview();
  }

  function initCategoryFilters() {
    var tagBtns = document.querySelectorAll(".filter-bar .tag-btn");
    tagBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        tagBtns.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");
        currentCategory = btn.getAttribute("data-category") || "All";
        renderBlogGrid();
      });
    });
  }

  function initSearch() {
    var searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", function (e) {
        searchQuery = e.target.value;
        renderBlogGrid();
      });
    }

    document.addEventListener("keydown", function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    });
  }

  function checkInitialHash() {
    if (window.location.hash) {
      var hashId = window.location.hash.substring(1);
      var post = BLOG_POSTS.find(function (p) {
        return p.id === hashId;
      });
      if (post) {
        window.openArticle(hashId);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderBlogGrid();
    initSandbox();
    initCategoryFilters();
    initSearch();
    checkInitialHash();

    var backBtn = document.getElementById("backToBlogBtn");
    if (backBtn) {
      backBtn.addEventListener("click", function (e) {
        e.preventDefault();
        window.showBlogList();
      });
    }
  });
})();
