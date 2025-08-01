/**
 * NodeManager 单元测试
 * 测试节点管理功能
 */

describe('NodeManager', () => {
    let manager;

    beforeEach(() => {
        manager = new NodeManager();
    });

    describe('generateNodeId', () => {
        test('should generate unique node IDs', () => {
            const id1 = manager.generateNodeId();
            const id2 = manager.generateNodeId();

            expect(id1).toBeDefined();
            expect(id2).toBeDefined();
            expect(id1).not.toBe(id2);
            expect(id1).toMatch(/^node_\d+_[a-z0-9]{9}$/);
            expect(id2).toMatch(/^node_\d+_[a-z0-9]{9}$/);
        });

        test('should generate IDs with different timestamps', () => {
            const ids = [];
            for (let i = 0; i < 10; i++) {
                ids.push(manager.generateNodeId());
            }

            // 验证所有ID都是唯一的
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });
    });

    describe('createNode', () => {
        test('should create node with basic information', () => {
            const lineInfo = {
                content: 'Test Node',
                level: 1,
                isHeader: false,
                isList: false
            };

            const node = manager.createNode(lineInfo);

            expect(node.id).toBeDefined();
            expect(node.data.title).toBe('Test Node');
            expect(node.data.collapse).toBe(false);
            expect(node.data.children.attached).toEqual([]);
        });

        test('should create header node', () => {
            const lineInfo = {
                content: '# Header',
                level: 1,
                isHeader: true,
                isList: false
            };

            const node = manager.createNode(lineInfo);

            expect(node.data.labels).toContainEqual({ text: 'header' });
            expect(node.data.title).toBe('Header');
        });

        test('should create list node', () => {
            const lineInfo = {
                content: '- List Item',
                level: 1,
                isHeader: false,
                isList: true
            };

            const node = manager.createNode(lineInfo);

            expect(node.data.title).toBe('List Item');
        });

        test('should handle empty content', () => {
            const lineInfo = {
                content: '',
                level: 0,
                isHeader: false,
                isList: false
            };

            const node = manager.createNode(lineInfo);

            expect(node.data.title).toBe('');
        });
    });

    describe('findParentNode', () => {
        test('should find correct parent node', () => {
            const stack = [
                { level: 0, node: { id: 'root', data: { title: 'Root' } } },
                { level: 1, node: { id: 'parent', data: { title: 'Parent' } } }
            ];
            const lineInfo = { level: 2 };

            const result = manager.findParentNode(stack, lineInfo);

            expect(result.parentNode.id).toBe('parent');
            expect(result.stack).toHaveLength(3);
            expect(result.stack[2].level).toBe(2);
        });

        test('should handle root level node', () => {
            const stack = [];
            const lineInfo = { level: 0 };

            const result = manager.findParentNode(stack, lineInfo);

            expect(result.parentNode).toBeNull();
            expect(result.stack).toHaveLength(1);
            expect(result.stack[0].level).toBe(0);
        });

        test('should handle deep nesting', () => {
            const stack = [
                { level: 0, node: { id: 'root' } },
                { level: 1, node: { id: 'level1' } },
                { level: 2, node: { id: 'level2' } },
                { level: 3, node: { id: 'level3' } }
            ];
            const lineInfo = { level: 4 };

            const result = manager.findParentNode(stack, lineInfo);

            expect(result.parentNode.id).toBe('level3');
            expect(result.stack).toHaveLength(5);
        });

        test('should handle same level node', () => {
            const stack = [
                { level: 0, node: { id: 'root' } },
                { level: 1, node: { id: 'sibling1' } }
            ];
            const lineInfo = { level: 1 };

            const result = manager.findParentNode(stack, lineInfo);

            expect(result.parentNode.id).toBe('root');
            expect(result.stack).toHaveLength(2);
            expect(result.stack[1].level).toBe(1);
        });
    });

    describe('attachNode', () => {
        test('should attach node to parent', () => {
            const parentNode = { 
                data: { 
                    children: { attached: [] } 
                } 
            };
            const newNode = { id: 'child', data: { title: 'Child' } };
            const forest = [];

            manager.attachNode(newNode, parentNode, forest);

            expect(parentNode.data.children.attached).toContain(newNode);
        });

        test('should add to forest if no parent', () => {
            const parentNode = null;
            const newNode = { id: 'root', data: { title: 'Root' } };
            const forest = [];

            manager.attachNode(newNode, parentNode, forest);

            expect(forest).toContain(newNode);
        });

        test('should handle multiple children', () => {
            const parentNode = { 
                data: { 
                    children: { attached: [] } 
                } 
            };
            const child1 = { id: 'child1', data: { title: 'Child 1' } };
            const child2 = { id: 'child2', data: { title: 'Child 2' } };
            const forest = [];

            manager.attachNode(child1, parentNode, forest);
            manager.attachNode(child2, parentNode, forest);

            expect(parentNode.data.children.attached).toHaveLength(2);
            expect(parentNode.data.children.attached).toContain(child1);
            expect(parentNode.data.children.attached).toContain(child2);
        });
    });

    describe('complex scenarios', () => {
        test('should handle complex nested structure', () => {
            const markdown = `
# Root
## Child 1
### Grandchild 1.1
## Child 2
### Grandchild 2.1
#### Great-grandchild 2.1.1
            `;

            const lines = markdown.trim().split('\n').map(line => ({
                content: line.trim(),
                level: (line.match(/^#+/) || [''])[0].length,
                isHeader: line.startsWith('#'),
                isList: false
            }));

            const forest = [];
            const stack = [];

            for (const lineInfo of lines) {
                const node = manager.createNode(lineInfo);
                const { parentNode, stack: newStack } = manager.findParentNode(stack, lineInfo);
                manager.attachNode(node, parentNode, forest);
                stack.length = 0;
                stack.push(...newStack);
            }

            expect(forest).toHaveLength(1);
            const rootNode = forest[0];
            expect(rootNode.data.title).toBe('Root');
            expect(rootNode.data.children.attached).toHaveLength(2);
        });

        test('should maintain correct hierarchy levels', () => {
            const nodes = [
                { level: 0, title: 'Root' },
                { level: 1, title: 'Child 1' },
                { level: 2, title: 'Grandchild 1.1' },
                { level: 1, title: 'Child 2' },
                { level: 2, title: 'Grandchild 2.1' }
            ];

            const forest = [];
            const stack = [];

            for (const nodeInfo of nodes) {
                const lineInfo = {
                    content: nodeInfo.title,
                    level: nodeInfo.level,
                    isHeader: nodeInfo.level === 0,
                    isList: false
                };

                const node = manager.createNode(lineInfo);
                const { parentNode, stack: newStack } = manager.findParentNode(stack, lineInfo);
                manager.attachNode(node, parentNode, forest);
                stack.length = 0;
                stack.push(...newStack);
            }

            expect(forest).toHaveLength(1);
            const rootNode = forest[0];
            const children = rootNode.data.children.attached;
            expect(children).toHaveLength(2);
            expect(children[0].data.title).toBe('Child 1');
            expect(children[1].data.title).toBe('Child 2');
        });
    });
}); 