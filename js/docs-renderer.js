(function () {
  var contentEl = document.getElementById("doc-content");
  var titleEl = document.getElementById("doc-title");
  var labelEl = document.getElementById("doc-label");
  var links = Array.prototype.slice.call(
    document.querySelectorAll(".docs-nav a[data-doc]"),
  );
  var params = new URLSearchParams(window.location.search);
  var defaultDoc = params.get("doc") ||
    "https://raw.githubusercontent.com/studioframes/condense/refs/heads/main/docs/overview.md";
  var searchKey = params.get("_search_key");

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatInline(text) {
    var escaped = escapeHtml(text);
    escaped = escaped.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
    escaped = escaped.replace(/`([^`]+)`/g, "<code>$1</code>");
    escaped = escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    escaped = escaped.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return escaped;
  }

  function isTableRow(line) {
    return /^\s*\|.+\|?\s*$/.test(line);
  }

  function isTableSeparator(line) {
    return /^\s*\|?(\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);
  }

  function parseTableCells(line) {
    var raw = line.trim().replace(/^\|/, "").replace(/\|$/, "");
    return raw.split("|").map(function (cell) {
      return cell.trim();
    });
  }

  function toTitle(docPath) {
    var leaf = String(docPath).split("/").pop();
    var name = leaf
      .replace(/^\.\//, "")
      .replace(/\.md$/i, "")
      .replace(/[-_]+/g, " ");

    if (name === "README") return "Documentation";
    if (name === "COMMANDS") return "Commands";
    if (name === "MIGRATION_GUIDE") return "Migration guide";

    return name.replace(/\b\w/g, function (char) {
      return char.toUpperCase();
    });
  }

  function renderMarkdown(markdown) {
    var lines = markdown.replace(/\r\n/g, "\n").split("\n");
    var html = [];
    var paragraphLines = [];
    var listItems = [];
    var listType = null;
    var inCodeBlock = false;
    var codeLines = [];
    var codeLang = "";

    function flushParagraph() {
      if (paragraphLines.length) {
        html.push("<p>" + formatInline(paragraphLines.join(" ")) + "</p>");
        paragraphLines = [];
      }
    }

    function flushList() {
      if (listItems.length) {
        var tag = listType === "ol" ? "ol" : "ul";
        html.push("<" + tag + ">" + listItems.join("") + "</" + tag + ">");
        listItems = [];
        listType = null;
      }
    }

    function flushCodeBlock() {
      if (codeLines.length) {
        html.push(
          '<pre><code class="language-' +
            escapeHtml(codeLang) +
            '">' +
            escapeHtml(codeLines.join("\n")) +
            "</code></pre>",
        );
        codeLines = [];
        codeLang = "";
      }
    }

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      var trimmed = line.trim();

      if (trimmed.startsWith("```")) {
        flushParagraph();
        flushList();
        if (inCodeBlock) {
          flushCodeBlock();
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

      if (isTableRow(trimmed)) {
        flushParagraph();
        flushList();
        var tableRows = [];
        while (i < lines.length && isTableRow(lines[i].trim())) {
          tableRows.push(lines[i]);
          i++;
        }
        i--;

        if (tableRows.length >= 2 && isTableSeparator(tableRows[1].trim())) {
          var headerCells = parseTableCells(tableRows[0]);
          var bodyRows = tableRows.slice(2);
          var thead =
            "<thead><tr>" +
            headerCells
              .map(function (cell) {
                return "<th>" + formatInline(cell) + "</th>";
              })
              .join("") +
            "</tr></thead>";
          var tbody =
            "<tbody>" +
            bodyRows
              .map(function (row) {
                var cells = parseTableCells(row);
                return (
                  "<tr>" +
                  cells
                    .map(function (cell) {
                      return "<td>" + formatInline(cell) + "</td>";
                    })
                    .join("") +
                  "</tr>"
                );
              })
              .join("") +
            "</tbody>";
          html.push("<table>" + thead + tbody + "</table>");
        } else {
          html.push("<p>" + formatInline(trimmed) + "</p>");
        }
        continue;
      }

      if (/^#{1,6}\s+/.test(trimmed)) {
        flushParagraph();
        flushList();
        var level = trimmed.match(/^#+/)[0].length;
        var headingText = trimmed.replace(/^#{1,6}\s+/, "");
        html.push(
          "<h" + level + ">" + formatInline(headingText) + "</h" + level + ">",
        );
        continue;
      }

      if (/^>\s?/.test(trimmed)) {
        flushParagraph();
        flushList();
        html.push(
          "<blockquote>" +
            formatInline(trimmed.replace(/^>\s?/, "")) +
            "</blockquote>",
        );
        continue;
      }

      if (/^[-*]\s+/.test(trimmed)) {
        flushParagraph();
        if (listType !== "ul") {
          flushList();
          listType = "ul";
        }
        listItems.push(
          "<li>" + formatInline(trimmed.replace(/^[-*]\s+/, "")) + "</li>",
        );
        continue;
      }

      if (/^\d+\.\s+/.test(trimmed)) {
        flushParagraph();
        if (listType !== "ol") {
          flushList();
          listType = "ol";
        }
        listItems.push(
          "<li>" + formatInline(trimmed.replace(/^\d+\.\s+/, "")) + "</li>",
        );
        continue;
      }

      if (/^---$/.test(trimmed)) {
        flushParagraph();
        flushList();
        html.push("<hr />");
        continue;
      }

      if (!trimmed) {
        flushParagraph();
        flushList();
        continue;
      }

      paragraphLines.push(trimmed);
    }

    flushParagraph();
    flushList();
    if (inCodeBlock) {
      flushCodeBlock();
    }

    return html.join("");
  }

  function findAndHighlightFirst(container, query) {
    if (!query) return false;
    var q = String(query).toLowerCase();
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null, false);
    var node;
    while ((node = walker.nextNode())) {
      var txt = node.nodeValue || '';
      var idx = txt.toLowerCase().indexOf(q);
      if (idx !== -1) {
        var before = txt.slice(0, idx);
        var match = txt.slice(idx, idx + query.length);
        var after = txt.slice(idx + query.length);
        var span = document.createElement('span');
        span.className = 'search-highlight';
        span.textContent = match;
        var beforeNode = document.createTextNode(before);
        var afterNode = document.createTextNode(after);
        var parent = node.parentNode;
        parent.insertBefore(beforeNode, node);
        parent.insertBefore(span, node);
        parent.insertBefore(afterNode, node);
        parent.removeChild(node);
        span.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return true;
      }
    }
    return false;
  }

  function setActive(docPath) {
    links.forEach(function (link) {
      link.classList.toggle(
        "is-active",
        link.getAttribute("data-doc") === docPath,
      );
    });
  }

  function sendSearchRenderedContent() {
    if (!searchKey || !window.parent || window.parent === window) return;
    window.parent.postMessage(
      {
        type: 'search-rendered-content',
        key: searchKey,
        url: window.location.pathname + window.location.search,
        title: titleEl.textContent || document.title,
        text: contentEl.innerText || ''
      },
      '*'
    );
  }

  function loadDocument(docPath) {
    setActive(docPath);
    titleEl.textContent = toTitle(docPath);
    labelEl.textContent = "Documentation";
    contentEl.innerHTML = '<p class="docs-loading">Loading document…</p>';

    fetch(docPath, { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) {
          throw new Error("Unable to load " + docPath);
        }
        return response.text();
      })
      .then(function (markdown) {
        contentEl.innerHTML =
          '<article class="docs-article">' +
          renderMarkdown(markdown) +
          "</article>";
        try {
          var q = new URLSearchParams(window.location.search).get('q');
          if (q) {
            findAndHighlightFirst(contentEl, decodeURIComponent(q));
          }
        } catch (e) {
          // ignore
        }
        sendSearchRenderedContent();
      })
      .catch(function () {
        contentEl.innerHTML =
          '<p class="docs-error">The selected document could not be loaded.</p>';
        sendSearchRenderedContent();
      });
  }

  links.forEach(function (link) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      var docPath = this.getAttribute("data-doc");
      history.replaceState({}, "", "?doc=" + encodeURIComponent(docPath));
      loadDocument(docPath);
    });
  });

  loadDocument(defaultDoc);
})();