import {
  AdmonitionDirectiveDescriptor,
  codeBlockPlugin,
  codeMirrorPlugin,
  diffSourcePlugin,
  directivesPlugin,
  frontmatterPlugin,
  headingsPlugin,
  imagePlugin,
  KitchenSinkToolbar,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  MDXEditorMethods,
  quotePlugin,
  sandpackPlugin,
  tablePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import "react-complex-tree/lib/style-modern.css";
import Split from "@uiw/react-split";

import "@mdxeditor/editor/style.css";
import "./App.css";
import "./editor.css";
import {virtuosoSampleSandpackConfig} from "./virtuosoSampleSandpackConfig.ts";
import {AlistFileTree} from "./AlistFileDataProvider.tsx";
import {useAsync, useMount, useSetState} from "react-use";
import {useEffect, useRef} from "react";
import {client} from "./service/alist-client.ts";
import {Button} from "@nextui-org/react";
import {updateQueryParameter} from "./UpdateQueryParameter.tsx";
import axios from "axios";

function App() {
  const ref = useRef<MDXEditorMethods>(null);
  const [state, setState] = useSetState({
    selectFile: "",
    fileContent: "",
    saveTip: "",
  });

  useMount(() => {
    const path = new URLSearchParams(location.search).get('path');
    setState({
      selectFile: path || ''
    })
  });

  useAsync(async () => {
    if (!state.selectFile) return;

    const getResp = await client.post('/api/fs/get', {"path": state.selectFile});
    const rawUrl = getResp.data.data.raw_url;
    const resp = await client.get(new URL(rawUrl).pathname);
    setState({
      fileContent:
        typeof resp.data === "string" ? resp.data : resp.data.message,
    });


    updateQueryParameter('path', state.selectFile);
  }, [state.selectFile]);

  useEffect(() => {
    ref.current?.setMarkdown(state.fileContent);
  }, [state.fileContent, state.selectFile]);

  const saveFileToRemote = async () => {
    if (!state.selectFile) return;
    setState({
      saveTip: "saving...",
    });
    await client.put("/api/fs/put", state.fileContent, {
      headers: {
        "File-Path": encodeURIComponent(state.selectFile),
        "Content-Type": "application/octet-stream",
      },
    });
    setState({
      saveTip: "save success",
    });

    setTimeout(() => {
      setState({
        saveTip: "",
      });
    }, 1000);
  };

  return (
    <div className="app">
      <Split lineBar style={{ border: "1px solid #d5d5d5", borderRadius: 3 }}>
        <div className="left">
          <AlistFileTree
            onSelectFile={(path) => setState({ selectFile: path })}
          />
        </div>

        <div className="right">
          {state.selectFile ? (
            <>
              <div className="right-title">
                <span>{state.selectFile}</span>

                <Button
                  onClick={() => {
                    saveFileToRemote();
                  }}
                  className="right-title-btn"
                  size="sm"
                  color="primary"
                >
                  保存
                </Button>

                <span>{state.saveTip}</span>
              </div>
              <MDXEditor
                ref={ref}
                markdown=""
                contentEditableClassName="prose"
                onChange={(value) => {
                  setState({
                    fileContent: value,
                  });
                }}
                plugins={[
                  listsPlugin(),
                  quotePlugin(),
                  headingsPlugin({ allowedHeadingLevels: [1, 2, 3] }),
                  linkPlugin(),
                  linkDialogPlugin(),
                  imagePlugin({
                    imageAutocompleteSuggestions: [
                      "https://via.placeholder.com/150",
                      "https://via.placeholder.com/150",
                    ],
                    imageUploadHandler: async (file) => {
                      console.log(file);
                      return "https://via.placeholder.com/150";
                    },
                  }),
                  tablePlugin(),
                  thematicBreakPlugin(),
                  frontmatterPlugin(),
                  codeBlockPlugin({ defaultCodeBlockLanguage: "txt" }),
                  sandpackPlugin({
                    sandpackConfig: virtuosoSampleSandpackConfig,
                  }),
                  codeMirrorPlugin({
                    codeBlockLanguages: {
                      js: "JavaScript",
                      css: "CSS",
                      txt: "text",
                      tsx: "TypeScript",
                    },
                  }),
                  directivesPlugin({
                    directiveDescriptors: [AdmonitionDirectiveDescriptor],
                  }),
                  diffSourcePlugin({
                    viewMode: "rich-text",
                    diffMarkdown: "boo",
                  }),
                  markdownShortcutPlugin(),
                  toolbarPlugin({
                    toolbarContents: () => (
                      <>
                        <KitchenSinkToolbar />
                      </>
                    ),
                  }),
                ]}
              />
            </>
          ) : (
            <div> please select a file. </div>
          )}
        </div>
      </Split>
    </div>
  );
}

export default App;
