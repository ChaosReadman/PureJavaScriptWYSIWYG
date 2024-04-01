// 変数定義（最初に実行される）
const editor = document.getElementsByClassName('simple-wysiwyg')[0];
const toolbar = editor.getElementsByClassName('toolbar')[0];
const buttons = toolbar.querySelectorAll('.editor-btn:not(.has-submenu)');
const contentArea = editor.getElementsByClassName('content-area')[0];
const visuellView = contentArea.getElementsByClassName('visuell-view')[0];
const htmlView = contentArea.getElementsByClassName('html-view')[0];
const modal = document.getElementsByClassName('modal')[0];


let aaaElm = document.getElementById("aaa");
document.getElementsByClassName("editor-btn");
document.querySelectorAll(".editor-btn");


// 選択領域の変更時イベントを提議
document.addEventListener('selectionchange', selectionChange);

// ペースト時のイベントを定義
visuellView.addEventListener('paste', pasteEvent);

// キー押下時のイベントを提議
contentArea.addEventListener('keypress', addParagraphTag);

// ツールバーボタンクリックして時イベントを定義
for (let i = 0; i < buttons.length; i++) {
  let button = buttons[i];

  button.addEventListener('click', function (e) {
    let action = this.dataset.action;

    switch (action) {
      case 'toggle-view':
        execCodeAction(this, editor);
        break;
      case 'createLink':
        execLinkAction();
        break;
      default:
        execDefaultAction(action);
    }

  });
}

/**
 * ヴィシュアルビューとHTMLビューのトグルを行なう
 */
function execCodeAction(button, editor) {

  if (button.classList.contains('active')) { // show visuell view
    visuellView.innerHTML = htmlView.value;
    htmlView.style.display = 'none';
    visuellView.style.display = 'block';

    button.classList.remove('active');
  } else {  // show html view
    htmlView.innerText = visuellView.innerHTML;
    visuellView.style.display = 'none';
    htmlView.style.display = 'block';

    button.classList.add('active');
  }
}

/**
 * 現在選択エリアにリンクを設定する
 */
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

/**
 * この関数はノーマルイベントを処理する
 */
function execDefaultAction(action) {
  myExecCommand(action, false);
  //  document.execCommand(action, false);
}

//選択範囲のstyle属性をスイッチのようにオンオフする
function switchStyleSelectedRange(property, value) {
  /// 現在のテキスト選択を取得
  const userSelection = window.getSelection();

  /// 現在の選択範囲を取得
  const selectedTextRange = userSelection.getRangeAt(0);
  
  //設定したいstyle属性の値
  const addStyle = `${property} : ${value};`;
  
  //styleの解除をするときfragmentだと不便だから、選択範囲のクローンを要素ノードに変換
  let fragment = selectedTextRange.cloneContents();
  const selectElm = document.createElement("span");
  selectElm.appendChild(fragment);

  
  console.log(`開始位置: ${selectedTextRange.startOffset}`);
  console.log(`終了位置: ${selectedTextRange.endOffset}`);
  console.log(``);
  
  //何も選択されてなかったら何もしない
  if(selectedTextRange.startOffset == selectedTextRange.endOffset) {
    console.log("return");
    return;
  };
  
  //選択範囲の親の子孫のstyleが既に設定されてれば解除
  //現在、複数回呼ばれると選択範囲がずれて上手く機能しないから要修正
  const parentElm = selectedTextRange.startContainer.parentElement;
  console.log(parentElm.outerHTML);
  let exeStyles = [];
  let childs = parentElm.querySelectorAll("span");
  for (let i = 0; i < childs.length; i++) {
    if (childs[i].getAttribute("style") == addStyle) exeStyles.push(childs[i]);
  }
  
  
  for (let i = 0; i < exeStyles.length; i++) {
    exeStyles[i].outerHTML = exeStyles[i].innerHTML;
  }
  
  
  console.log(parentElm.outerHTML);

  if (exeStyles.length > 0) return;


  //選択範囲の親の親以上のstyleを解除
  

  //styleを設定したspan要素の中に選択範囲を追加
  const span = document.createElement("span");
  span.setAttribute("style", addStyle);
  span.innerHTML = selectElm.innerHTML;


  //なぜかpタグが勝手に挿入されるから要修正
  //とりあえず選択範囲をspanで囲ってる。
  //でもbloggerは子要素1つ1つをタグで囲ってstyle変更してるから、bloggerを参考に作成中
  //多分こうしないとstyleの解除が難しい
  //ってか子要素をまとめてタグで囲むとstyleの解除が難しかった
  //やり方が下手なだけかもしれないから、良いやり方があったらコード書いてほしい
  selectedTextRange.deleteContents(); //選択範囲をの要素を削除
  selectedTextRange.insertNode(span); //選択範囲にstyleが適用された要素を追加

  //surroundContentsだとstyleの解除が難しいことが分かったから使わない
  //複数行選択してstyleを変更できないデメリットもある。もしかしたら他の要因でできないだけかも。
  //うまくやればできるかもだから、一応コメントで残しておく
  // selectedTextRange.surroundContents(span)
}


function myExecCommand(action, b) {
  if (action == "bold") switchStyleSelectedRange("font-weight", action);
  if (action == "italic") switchStyleSelectedRange("font-style", action);
  if (action == "underline") switchStyleSelectedRange("text-decoration", action);
  if (action == "strikeThrough") switchStyleSelectedRange("text-decoration", "line-through");
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

/**
 *  保存した選択範囲をロードする
 */
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

/**
 * 現在の選択範囲をアクティブ・インアクティブに変更する
 */
function selectionChange(e) {

  for (let i = 0; i < buttons.length; i++) {
    let button = buttons[i];

    // don't remove active class on code toggle button
    if (button.dataset.action === 'toggle-view') continue;

    button.classList.remove('active');
  }

  if (!childOf(window.getSelection().anchorNode.parentNode, editor)) return false;

  parentTagActive(window.getSelection().anchorNode.parentNode);
}

/**
 * 渡された子の親をチェックする
 */
function childOf(child, parent) {
  return parent.contains(child);
}

/**
 * 現在の選択範囲にわたされたタグが設定可能かチェックする
 */
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

/**
 * ペーストされたものをチェックしてHTMLを除去する
 */
function pasteEvent(e) {
  e.preventDefault();

  let text = (e.originalEvent || e).clipboardData.getData('text/plain');
  document.execCommand('insertHTML', false, text);
}

/**
 * エンターキー押下時にパラグラフタグを追加する
 */
function addParagraphTag(evt) {
  if (evt.keyCode == '13') {

    // don't add a p tag on list item
    if (window.getSelection().anchorNode.parentNode.tagName === 'LI') return;
    document.execCommand('formatBlock', false, 'p');
  }
}