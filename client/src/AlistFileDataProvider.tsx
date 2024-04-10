import {
    ControlledTreeEnvironment,
    Tree,
    TreeItem,
    TreeItemIndex,
} from "react-complex-tree";
import {useMount, useSetState} from "react-use";
import {client} from "./service/alist-client.ts";
import {Button} from "@nextui-org/react";
import filesvg from "./assets/addFile.svg";



export async function getFileList(basePath: string) {
    const resp = await client.post(
        '/api/fs/list',
        {"path": basePath, "password": "", "page": 1, "per_page": 0, "refresh": true}
    );
    const fileList = resp.data.data.content;
    const newFileItems: Record<string, TreeItem> = {};

    fileList.forEach((it: any) => {
        const index = basePath + '/' + it.name;
        newFileItems[index] = {
            index,
            canMove: true,
            isFolder: it.is_dir,
            children: undefined,
            data: it.name,
            canRename: true
        };
    });

    return newFileItems;
}

export async function mountFileList(base: Record<string, TreeItem>, mountPath: string, mountName: string) {
    const append = await getFileList(mountPath);
    const result = {...base, ...append};
    const mountItem = result[mountName];

    Object.keys(append).forEach(key => {
        const item = append[key];
        if (!mountItem.children) mountItem.children = [];
        mountItem.children.push(item.index);
    });

    return result;
}


export interface IAlistFileTreeProps {
    onSelectFile: (path: string) => void;
}

export const AlistFileTree = (props: IAlistFileTreeProps) => {
    const [state, setState] = useSetState({
        fileItems: {} as Record<string, TreeItem>,
        focusedItem: '' as TreeItemIndex,
        expandedItems: [] as TreeItemIndex[],
        selectedItems: [] as TreeItemIndex[],
    });

    useMount(async () => {
        const fileItems = {
            root: {
                index: 'root',
                canMove: true,
                isFolder: true,
                children: [],
                data: 'Root item',
                canRename: true,
            },
        } as Record<string, TreeItem>;

        const basePath = '';

        const newFileItems = await mountFileList(fileItems, basePath, 'root');

        setState({
            fileItems: newFileItems,
        });
    });
    return (
        <>
            <div className="left-tool">
                <Button isIconOnly size="sm" className="left-tool-btn"
                        onClick={async () => {
                            const fileName =  new Date().getTime() + '.md';
                            const filePath = '/' + fileName;
                            await client.put("/api/fs/put", '新的文件', {
                                headers: {
                                    "File-Path": filePath,
                                    "Content-Type": "application/octet-stream",
                                },
                            });

                            const newFileItems = {...state.fileItems};
                            newFileItems['root'].children?.push(filePath);
                            newFileItems[filePath] = {
                                index: filePath,
                                canMove: true,
                                isFolder: false,
                                data: fileName,
                                canRename: true
                            }

                            setState({
                                fileItems: newFileItems,
                            });
                        }}
                >
                    <img src={filesvg} alt=""/>
                </Button>
            </div>

            <ControlledTreeEnvironment
                items={state.fileItems}
                getItemTitle={item => item.data}
                onRenameItem={async (item, newName) => {

                    const resp = await client.post('/api/fs/rename', {
                        "name": newName,
                        "path": item.index
                    });

                    if (resp.status === 200 && resp.data.code === 200) {
                        const newItems = {...state.fileItems};
                        const oldItem = newItems[item.index];
                        delete newItems[item.index];

                        Object.keys(newItems).forEach(key => {
                            const it = newItems[key];
                            if (it.children) {
                                it.children = it.children.map(child => {
                                    if (child === item.index) {
                                        return (item.index as string).replace(item.data, newName);
                                    }
                                    return child;
                                });
                            }
                        })

                        oldItem.index = (item.index as string).replace(item.data, newName);
                        oldItem.data = newName;

                        newItems[oldItem.index] = oldItem;

                        setState({ fileItems: newItems });
                    }

                }}
                onFocusItem={async (item) => {
                    setState({focusedItem: item.index});
                    if (!item.isFolder) {
                        props.onSelectFile(item.index as string);
                    }
                }}
                onExpandItem={async (item) => {
                    if (item.isFolder) {
                        if (!item.children) {
                            const newFileItems = await mountFileList(state.fileItems, item.index as string, item.index as string);
                            setState({
                                fileItems: newFileItems,
                            });
                        }

                        setState({
                            expandedItems: [...state.expandedItems, item.index],
                        });

                    }
                }}
                onCollapseItem={item => {
                    setState({
                        expandedItems: state.expandedItems.filter(it => it !== item.index),
                    });
                }}
                onSelectItems={items => {
                    setState({selectedItems: items});
                }}
                viewState={{
                    ['tree-1']: {
                        focusedItem: state.focusedItem,
                        expandedItems: state.expandedItems,
                        selectedItems: state.selectedItems,
                    }
                }}
            >
                <Tree treeId="tree-1" rootItem="root" treeLabel="Tree Example"/>
            </ControlledTreeEnvironment>
        </>

    )
}
