'use strict'

/* global $, siteRoot */

let mde

export default {
  name: 'editor',
  props: ['currentPath'],
  data() {
    return {}
  },
  computed: {
    insertContent() {
      return this.$store.state.editor.insertContent
    }
  },
  methods: {
    insert(content) {
      if (mde.codemirror.doc.somethingSelected()) {
        mde.codemirror.execCommand('singleSelection')
      }
      mde.codemirror.doc.replaceSelection(this.insertContent)
    },
    save() {
      let self = this
      this.$http.put(window.location.href, {
        markdown: mde.value()
      }).then(resp => {
        return resp.json()
      }).then(resp => {
        if (resp.ok) {
          window.location.assign(siteRoot + '/' + self.currentPath)
        } else {
          self.$store.dispatch('alert', {
            style: 'red',
            icon: 'ui-2_square-remove-09',
            msg: resp.msg
          })
        }
      }).catch(err => {
        self.$store.dispatch('alert', {
          style: 'red',
          icon: 'ui-2_square-remove-09',
          msg: 'Error: ' + err.body.msg
        })
      })
    }
  },
  mounted() {
    let self = this
    FuseBox.import('/js/simplemde/simplemde.min.js', (SimpleMDE) => {
      mde = new SimpleMDE({
        autofocus: true,
        autoDownloadFontAwesome: false,
        element: this.$refs.editorTextArea,
        placeholder: 'Enter Markdown formatted content here...',
        spellChecker: false,
        status: false,
        toolbar: [
          {
            name: 'bold',
            action: SimpleMDE.toggleBold,
            className: 'icon-bold',
            title: 'Bold'
          },
          {
            name: 'italic',
            action: SimpleMDE.toggleItalic,
            className: 'icon-italic',
            title: 'Italic'
          },
          {
            name: 'strikethrough',
            action: SimpleMDE.toggleStrikethrough,
            className: 'icon-strikethrough',
            title: 'Strikethrough'
          },
          '|',
          {
            name: 'heading-1',
            action: SimpleMDE.toggleHeading1,
            className: 'icon-header fa-header-x fa-header-1',
            title: 'Header (Level 1)'
          },
          {
            name: 'heading-2',
            action: SimpleMDE.toggleHeading2,
            className: 'icon-header fa-header-x fa-header-2',
            title: 'Header (Level 2)'
          },
          {
            name: 'heading-3',
            action: SimpleMDE.toggleHeading3,
            className: 'icon-header fa-header-x fa-header-3',
            title: 'Header (Level 3)'
          },
          {
            name: 'quote',
            action: SimpleMDE.toggleBlockquote,
            className: 'nc-icon-outline text_quote',
            title: 'Quote'
          },
          {
            name: 'info',
            action: (editor) => { createContainer(editor, "info"); },
            className: 'nc-icon-outline travel_info',
            title: 'Info'
          },
          {
            name: 'warning',
            action: (editor) => { createContainer(editor, "warning"); },
            className: 'nc-icon-outline ui-2_alert-circle',
            title: 'Warning'
          },
          {
            name: 'danger',
            action: (editor) => { createContainer(editor, "danger"); },
            className: 'nc-icon-outline ui-2_alert-circle-',
            title: 'Danger'
          },
          '|',
          {
            name: 'unordered-list',
            action: SimpleMDE.toggleUnorderedList,
            className: 'nc-icon-outline text_list-bullet',
            title: 'Bullet List'
          },
          {
            name: 'ordered-list',
            action: SimpleMDE.toggleOrderedList,
            className: 'nc-icon-outline text_list-numbers',
            title: 'Numbered List'
          },
          '|',
          {
            name: 'link',
            action: SimpleMDE.drawLink,
            className: 'nc-icon-outline ui-2_link-68',
            title: 'Insert Link'
          },
          {
            name: 'image',
            action: (editor) => {
              self.$store.dispatch('editorFile/open', { mode: 'image' })
            },
            className: 'nc-icon-outline design_image',
            title: 'Insert Image'
          },
          {
            name: 'file',
            action: (editor) => {
              self.$store.dispatch('editorFile/open', { mode: 'file' })
            },
            className: 'nc-icon-outline files_zip-54',
            title: 'Insert File'
          },
          {
            name: 'video',
            action: (editor) => {
              self.$store.dispatch('editorVideo/open')
            },
            className: 'nc-icon-outline media-1_video-64',
            title: 'Insert Video Player'
          },
          '|',
          {
            name: 'inline-code',
            action: (editor) => {
              if (!editor.codemirror.doc.somethingSelected()) {
                return self.$store.dispatch('alert', {
                  style: 'orange',
                  icon: 'design_drag',
                  msg: 'Invalid selection. Select at least 1 character.'
                })
              }
              let curSel = editor.codemirror.doc.getSelections()
              curSel = self._.map(curSel, (s) => {
                return '`' + s + '`'
              })
              editor.codemirror.doc.replaceSelections(curSel)
            },
            className: 'nc-icon-outline arrows-4_enlarge-46',
            title: 'Inline Code'
          },
          {
            name: 'code-block',
            action: (editor) => {
              self.$store.dispatch('editorCodeblock/open', {
                initialContent: (mde.codemirror.doc.somethingSelected()) ? mde.codemirror.doc.getSelection() : ''
              })
            },
            className: 'nc-icon-outline design_code',
            title: 'Code Block'
          },
          '|',
          {
            name: 'table',
            action: SimpleMDE.drawTable,
            className: 'nc-icon-outline ui-2_grid-square',
            title: 'Insert Table'
          },
          {
            name: 'horizontal-rule',
            action: SimpleMDE.drawHorizontalRule,
            className: 'nc-icon-outline design_distribute-vertical',
            title: 'Horizontal Rule'
          }
        ],
        shortcuts: {
          'toggleBlockquote': null,
          'toggleFullScreen': null,
          'toggleOrderedList': null,
          'toggleCodeBlock': null
        }
      })
      
      mde.codemirror.on("inputRead", function(cm, event){
          if (event.origin == "paste"){
            let text = "";
            let k;
            for (k in event.text){
                if (k > 0){
                    text += "\n";
                }
                text += event.text[k];
            }
            
            if (!text.includes(" ")){
            
                let newText = text;
                const myRoot = "/" + self.currentPath.split("/")[0];
                const linkComponents = text.split("/");
            
                if (text.includes(myRoot)){
                    const URIComponents = text.replace("http://", "").replace("https://", "").split("/");
                    URIComponents.shift();
                    const title = URIComponents[URIComponents.length-1]
                    newText = "["+title.toUpperCase().charAt(0).toUpperCase() + title.slice(1)+"](/"+URIComponents.join("/")+")";
                }
                else if (linkComponents[0].includes("http")){
                    const title = linkComponents[linkComponents.length-1];
                    newText = "["+title.toUpperCase().charAt(0).toUpperCase() + title.slice(1)+"]("+text+")";
                }
                cm.refresh();
                // my first idea was
                // note: for multiline strings may need more complex calculations
                cm.replaceRange(newText, event.from, {line: event.from.line, ch: event.from.ch + text.length});
            }          
          }
      });

      // Save
      $(window).bind('keydown', (ev) => {
        if ((ev.ctrlKey || ev.metaKey) && !(ev.altKey)) {
          switch (String.fromCharCode(ev.which).toLowerCase()) {
            case 's':
              ev.preventDefault()
              self.save()
              break
          }
        }
      })

      // Listeners
      this.$root.$on('editor/save', this.save)
      this.$root.$on('editor/insert', this.insert)

      this.$store.dispatch('pageLoader/complete')
    })
  }
}

function createContainer(editor, name){
    const cm = editor.codemirror;
    
    var startPoint = cm.getCursor("start");
    var endPoint = cm.getCursor("end");
    
    let linePositions = [startPoint.line]
    
    if (endPoint.line != startPoint.line)
        linePositions.push(endPoint.line);
    
    for (let lineI in linePositions){
        const line = linePositions[lineI];
        let txt = cm.getLine(line);
        if (line == startPoint.line) txt = "::: "+name+"\n"+txt;
        if (line == endPoint.line) txt += "\n:::";
        
        cm.replaceRange(txt, {
            line: line,
            ch: 0
        }, {
            line: line,
            ch: 99999999999999
        });
    } 
    cm.focus();         

}