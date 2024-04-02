// 変数定義（最初に実行される）
const editor = document.getElementsByClassName('simple-wysiwyg')[0];
const toolbar = editor.getElementsByClassName('toolbar')[0];
const buttons = toolbar.querySelectorAll('.editor-btn:not(.has-submenu)');
const contentArea = editor.getElementsByClassName('content-area')[0];
const visuellView = contentArea.getElementsByClassName('visuell-view')[0];
const htmlView = contentArea.getElementsByClassName('html-view')[0];
const modal = document.getElementsByClassName('modal')[0];
const toolbarBtns = document.querySelectorAll(".editor-btn");

// ペースト時のイベントを定義
visuellView.addEventListener('paste', pasteEvent);

// キー押下時のイベントを提議
contentArea.addEventListener('keypress', addParagraphTag);

//現在選択エリアにリンクを設定する
function execLinkAction() {
  modal.style.display = 'block';
  let selection = saveSelection();

  let submit = modal.querySelectorAll('button.done')[0];
  let close = modal.querySelectorAll('.close')[0];

  // done button active => add link
  submit.addEventListener('click', function (e) {
    e.preventDefault();
    let newTabCheckbox = modal.querySelectorAll('#new-tab')[0];
    let linkInput = modal.querySelectorAll('#linkValue')[0];
    let linkValue = linkInput.value;
    let newTab = newTabCheckbox.checked;

    restoreSelection(selection);

    if (window.getSelection().toString()) {
      let a = document.createElement('a');
      a.href = linkValue;
      if (newTab) a.target = '_blank';
      window.getSelection().getRangeAt(0).surroundContents(a);
    }

    modal.style.display = 'none';
    linkInput.value = '';

    // deregister modal events
    submit.removeEventListener('click', arguments.callee);
    close.removeEventListener('click', arguments.callee);
  });

  // モーダルダイアログのX(閉じる)ボタンクリック時
  close.addEventListener('click', function (e) {
    e.preventDefault();
    let linkInput = modal.querySelectorAll('#linkValue')[0];

    modal.style.display = 'none';
    linkInput.value = '';

    // deregister modal events
    submit.removeEventListener('click', arguments.callee);
    close.removeEventListener('click', arguments.callee);
  });
}

let selectedTextRange;
function getSelectionRangeElm() {
  //styleの解除をするときfragmentだと不便だから、選択範囲のクローンを要素ノードに変換
  let fragment = selectedTextRange.cloneContents();
  const selectElm = document.createElement("span");
  selectElm.appendChild(fragment);

  return selectElm
}

//選択範囲のstyle属性をスイッチのようにオンオフする
function switchStyleSelectedRange(styleValue) {
  let parentElm = document.getSelection().getRangeAt(0).startContainer.parentElement ;
  
  //子要素のstyleを整える
  
  //親要素辿ってstyleを整える
  for (; ;) {
    console.log(parentElm);
    // if()
    if (parentElm.getAttribute("id") == "visualView") break;

    parentElm = parentElm.parentElement  ;
  }


}

for (let i = 0; i < toolbarBtns.length; i++) {
  toolbarBtns[i].addEventListener("click", () => {
    if (!window.getSelection().isCollapsed) selectedTextRange = window.getSelection().getRangeAt(0);
    const elmId = toolbarBtns[i].getAttribute("id");
    if (elmId == "boldBtn") switchStyleSelectedRange("font-weight : bold;");
    if (elmId == "italicBtn") "";
    if (elmId == "underlineBtn") "";
    if (elmId == "strikethroughBtn") "";
    if (elmId == "alignCenterBtn") "";
    if (elmId == "createLink") execLinkAction();
    if (elmId == "showHtmlBtn") { //htmlビューのトグル切り替え
      const visualView = document.getElementById("visualView");
      const htmlView = document.getElementById("htmlView");
      if (htmlView.style.display == "none") {
        htmlView.style.display = "block";
        visualView.style.display = "none";
        htmlView.innerHTML = visualView.innerHTML;
      } else {
        htmlView.style.display = "none";
        visualView.style.display = "block";
      }
    }

  });
}

/**
 * 現在の選択範囲を保存する
 */
function saveSelection() {
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      let ranges = [];
      for (var i = 0, len = sel.rangeCount; i < len; ++i) {
        ranges.push(sel.getRangeAt(i));
      }
      return ranges;
    }
  } else if (document.selection && document.selection.createRange) {
    return document.selection.createRange();
  }
  return null;
}

//保存した選択範囲をロードする
function restoreSelection(savedSel) {
  if (savedSel) {
    if (window.getSelection) {
      sel = window.getSelection();
      sel.removeAllRanges();
      for (var i = 0, len = savedSel.length; i < len; ++i) {
        sel.addRange(savedSel[i]);
      }
    } else if (document.selection && savedSel.select) {
      savedSel.select();
    }
  }
}

//渡された子の親をチェックする
function childOf(child, parent) {
  return parent.contains(child);
}

//現在の選択範囲にわたされたタグが設定可能かチェックする
function parentTagActive(elem) {
  if (!elem || !elem.classList || elem.classList.contains('visuell-view')) return false;

  let toolbarButton;

  // active by tag names
  let tagName = elem.tagName.toLowerCase();
  toolbarButton = document.querySelectorAll(`.toolbar .editor-btn[data-tag-name="${tagName}"]`)[0];
  if (toolbarButton) {
    toolbarButton.classList.add('active');
  }

  // active by text-align
  let textAlign = elem.style.textAlign;
  toolbarButton = document.querySelectorAll(`.toolbar .editor-btn[data-style="textAlign:${textAlign}"]`)[0];
  if (toolbarButton) {
    toolbarButton.classList.add('active');
  }

  return parentTagActive(elem.parentNode);
}

//ペーストされたものをチェックしてHTMLを除去する
function pasteEvent(e) {
  e.preventDefault();

  let text = (e.originalEvent || e).clipboardData.getData('text/plain');
  document.execCommand('insertHTML', false, text);
}

//エンターキー押下時にパラグラフタグを追加する
function addParagraphTag(evt) {
  if (evt.keyCode == '13') {

    // don't add a p tag on list item
    if (window.getSelection().anchorNode.parentNode.tagName === 'LI') return;
    document.execCommand('formatBlock', false, 'p');
  }
}