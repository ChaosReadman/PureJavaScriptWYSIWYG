// 変数定義（最初に実行される）
const editor = document.getElementsByClassName('simple-wysiwyg')[0];
const toolbar = document.getElementById('toolbar');
const contentArea = document.getElementById('content-area');
const modal = document.getElementById('modal');
const visuallView = document.getElementById("visualView");
const htmlView = document.getElementById("htmlView");
const toolbarBtns = document.querySelectorAll(".editor-btn");


//ツールバーの押されたボタンに応じた処理を実行
for (let i = 0; i < toolbarBtns.length; i++) {
  const btnId = toolbarBtns[i].getAttribute("id"); //判定用にボタン要素のidを取得する
  toolbarBtns[i].addEventListener("click", (e) => {
    if (btnId == "boldBtn") document.execCommand("bold"); //太字
    if (btnId == "italicBtn") document.execCommand("italic"); //斜体
    if (btnId == "underlineBtn") document.execCommand("underline"); //下線
    if (btnId == "strikethroughBtn") document.execCommand("strikethrough"); //取消線
    if (btnId == "alignCenterBtn") document.execCommand("justifyCenter"); //中央揃え
    if (btnId == "alignLeftBtn") document.execCommand("justifyLeft"); //左揃え
    if (btnId == "alignRightBtn") document.execCommand("justifyRight"); //右揃え
    if (btnId == "alignJustifyBtn") document.execCommand("justifyFull"); //両端揃え
    if (btnId == "numberedListBtn") document.execCommand("insertOrderedList"); //番号付きリスト
    if (btnId == "bulletedListBtn") document.execCommand("insertUnorderedList"); //リスト
    if (btnId == "outdentBtn") document.execCommand("outdent"); //インデントを減らす
    if (btnId == "indentBtn") document.execCommand("indent"); //インデントを増やす
    if (btnId == "horizontalLineBtn") document.execCommand("insertHorizontalRule"); //水平線
    if (btnId == "undoBtn") document.execCommand("undo"); //戻る
    if (btnId == "removeFormatBtn") document.execCommand("removeformat"); //文字修飾を削除
    if (btnId == "addLinkBtn") execLinkAction(); //リンク追加
    if (btnId == "deleteLinkBtn") document.execCommand("unlink"); //リンク削除
    if (btnId == "insertImgBtn") document.execCommand("insertImage"); //画像挿入
    if (btnId == "showHtmlBtn") { //HTMLコードの表示
      //htmlViewとvisualViewの表示・非表示を切り替える
      if (htmlView.style.display == "none") {
        htmlView.innerHTML = visuallView.innerHTML;
        htmlView.style.display = "block";
        visuallView.style.display = "none"
      } else {
        visuallView.innerHTML = htmlView.value;
        htmlView.style.display = "none";
        visuallView.style.display = "block"
      }
    }
  });
}

document.addEventListener('selectionchange', selectionChange); // 選択領域の変更時イベントを提議
contentArea.addEventListener('keypress', addParagraphTag); // キー押下時のイベントを提議

//リンク挿入ボタン押された時の処理
function execLinkAction() {
  //範囲選択されてないならreturn
  if (document.getSelection().isCollapsed) return;

  modal.style.display = 'block';
  //選択範囲を保存。なぜならユーザーがリンクを入力する際、visualViewの範囲選択が解除されるから。
  let selection = saveSelection();

  let submit = modal.querySelectorAll('button.done')[0];
  let close = document.getElementById('close');

  // done button active => add link
  submit.addEventListener('click', function (e) {
    e.preventDefault();
    //要素取得
    let newTabCheckbox = modal.querySelectorAll('#new-tab')[0];
    let linkInput = modal.querySelectorAll('#linkValue')[0];

    //ユーザーの入力を変数に保存
    let linkValue = linkInput.value;
    let newTab = newTabCheckbox.checked;

    //選択範囲を復元
    restoreSelection(selection);

    //選択範囲を<a href="" target="_blank"></a>で囲む
    let a = document.createElement('a');
    a.href = linkValue;
    if (newTab) a.target = '_blank';
    window.getSelection().getRangeAt(0).surroundContents(a);

    //モーダルを非表示にする
    modal.style.display = 'none';
    //テキストボックス内容を空白にする
    linkInput.value = '';

    // ボタンのイベントリスナーを解除
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

//現在の選択範囲を保存する
function saveSelection() {
  if (window.getSelection) { //メソッドがサポートされているか(Internet Explorer 8 以降)
    selection = window.getSelection();
    if (selection.getRangeAt && selection.rangeCount) { //getRangeAtとrangeCountがサポートされているか
      let ranges = [];
      for (var i = 0, len = selection.rangeCount; i < len; ++i) {
        ranges.push(selection.getRangeAt(i));
      }
      return ranges;
    }
  } else if (document.selection && document.selection.createRange) {//メソッドが使えるか(Internet Explorer 8 以前)
    return document.selection.createRange(); //選択範囲のrangeオブジェクトを返す
  }

  //何も使える関数がサポートされていなければnull返す
  return null;
}

//保存した選択範囲をロードする
function restoreSelection(savedSelection) {
  if (savedSelection) { //null以外なら保存した選択範囲をロード
    if (window.getSelection) { //メソッドがサポートされているか(Internet Explorer 8 以降)
      sel = window.getSelection();
      sel.removeAllRanges(); //選択範囲に関する全てのrange
      for (var i = 0, len = savedSelection.length; i < len; ++i) {
        sel.addRange(savedSelection[i]);
      }
    } else if (document.selection && savedSelection.select) { //メソッドが使えるか(Internet Explorer 8 以前)
      savedSelection.select();
    }
  }
}

//現在の選択範囲をアクティブ・インアクティブに変更する
function selectionChange(e) {

  for (let i = 0; i < toolbarBtns.length; i++) {
    let button = toolbarBtns[i];

    // don't remove active class on code toggle button
    if (button.dataset.action === 'toggle-view') continue;

    button.classList.remove('active');
  }

  if (!childOf(window.getSelection().anchorNode.parentNode, editor)) return false;

  parentTagActive(window.getSelection().anchorNode.parentNode);
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