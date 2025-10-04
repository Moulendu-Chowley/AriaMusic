import { Command } from '../../structures/index.js';

/**
 * @extends {Command}
 */
export default class MoveNode extends Command {
    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     */
    constructor(client) {
        super(client, {
            name: 'movenode',
            description: {
                content: 'commands.movenode.description',
                examples: ['movenode', 'movenode node2'],
                usage: 'movenode [nodeId]',
            },
            category: 'dev',
            aliases: ['mn'],
            cooldown: 3,
            args: false,
            vote: false,
            player: {
                voice: false,
                dj: false,
                active: true,
                djPerm: null,
            },
            permissions: {
                dev: true,
                client: [
                    'SendMessages',
                    'ReadMessageHistory',
                    'ViewChannel',
                    'EmbedLinks',
                ],
                user: [],
            },
            slashCommand: true,
            options: [
                {
                    name: 'node',
                    description: 'commands.movenode.options.node',
                    type: 3,
                    required: false,
                },
            ],
        });
    }

    /**
     * @param {import('../../structures/AriaMusic.js').AriaMusic} client
     * @param {import('../../structures/Content.js').Content} cnt
     * @param {string[]} args
     */
    async run(client, cnt, args) {
        let nodeId;
        if (args.length > 0) {
            nodeId = args.join(' ');
        } else if (cnt.options && typeof cnt.options.get === 'function') {
            const nodeOption = cnt.options.get('node', false);
            nodeId = nodeOption?.value;
        } else {
            nodeId = undefined;
        }

        const allPlayers = client.manager.players;
        if (allPlayers.size === 0) {
            return await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.movenode.no_players"),
                        color: this.client.color.red,
                    },
                ],
            });
        }

        const currentNodeId =
            allPlayers.size > 0
                ? allPlayers.values().next().value?.node.options.id
                : null;

        if (!nodeId) {
            const availableNodes = client.manager.nodeManager.nodes
                .filter((node) => node.connected && node.options.id !== currentNodeId)
                .map((node) => node.options.id);

            if (availableNodes.length === 0) {
                return await cnt.sendMessage({
                    embeds: [
                        {
                            description: cnt.get("commands.movenode.no_available_nodes"),
                            color: this.client.color.red,
                        },
                    ],
                });
            }

            const currentNodeText = currentNodeId
                ? `**${cnt.get("commands.movenode.current_node")}:** ${currentNodeId}`
                : '';
            const availableNodesList = availableNodes
                .map((id) => `• ${id}`)
                .join('\n');
            const availableNodesText = `**${cnt.get("commands.movenode.available_nodes"
            )}:**\n${availableNodesList}`;

            return await cnt.sendMessage({
                embeds: [
                    {
                        title: cnt.get("commands.movenode.available_nodes_title"),
                        description: `${currentNodeText}\n\n${availableNodesText}`,
                        color: this.client.color.main,
                        footer: {
                            text: cnt.get("commands.movenode.usage_hint"),
                        },
                    },
                ],
            });
        }

        const targetNode = client.manager.nodeManager.nodes.get(nodeId);
        if (!targetNode) {
            return await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.movenode.node_not_found", {
                            node: nodeId,
                        }),
                        color: this.client.color.red,
                    },
                ],
            });
        }

        if (!targetNode.connected) {
            return await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.movenode.node_not_connected", {
                            node: nodeId,
                        }),
                        color: this.client.color.red,
                    },
                ],
            });
        }

        const allOnTarget = Array.from(allPlayers.values()).every(
            (player) => player.node.options.id === nodeId
        );
        if (allOnTarget) {
            return await cnt.sendMessage({
                embeds: [
                    {
                        description: cnt.get("commands.movenode.same_node", { node: nodeId }),
                        color: this.client.color.red,
                    },
                ],
            });
        }

        try {
            if (
                cnt.interaction &&
                !cnt.interaction.replied &&
                !cnt.interaction.deferred
            ) {
                await cnt.sendMessage({
                    embeds: [
                        {
                            description: cnt.get("commands.movenode.moving_all_players", {
                                node: nodeId,
                            }),
                            color: this.client.color.main,
                        },
                    ],
                });
            }

            const results = [];
            for (const player of allPlayers.values()) {
                if (player.node.options.id === nodeId) continue;
                const fromNodeId = player.node.options.id ?? 'unknown';
                try {
                    await player.moveNode(nodeId);
                    results.push({
                        guildId: player.guildId,
                        from: fromNodeId,
                        to: nodeId,
                    });
                } catch (err) {
                    results.push({
                        guildId: player.guildId,
                        from: fromNodeId,
                        to: nodeId,
                        error: err instanceof Error ? err.message : String(err),
                    });
                }
            }

            const successMoves = results.filter((r) => !r.error);
            const failedMoves = results.filter((r) => r.error);

            let description = '';
            if (successMoves.length > 0) {
                description +=
                    cnt.get("commands.movenode.moved_players", {
                        list: successMoves
                            .map((r) =>
                                cnt.get("commands.movenode.guild_move", {
                                    guildId: r.guildId,
                                    from: r.from,
                                    to: r.to,
                                })
                            )
                            .join('\n'),
                    }) + '\n';
            }

            if (failedMoves.length > 0) {
                description +=
                    '\n' +
                    cnt.get("commands.movenode.failed_moves", {
                        list: failedMoves
                            .map((r) =>
                                cnt.get("commands.movenode.guild_move_failed", {
                                    guildId: r.guildId,
                                    error: r.error,
                                })
                            )
                            .join('\n'),
                    });
            }

            if (description === '') {
                description = cnt.get("commands.movenode.no_players_moved");
            }

            const resultTitle = cnt.get("commands.movenode.results_title");
            const resultColor =
                failedMoves.length > 0
                    ? this.client.color.red
                    : this.client.color.green;
            const resultTimestamp = new Date().toISOString();

            if (
                cnt.interaction &&
                (cnt.interaction.replied || cnt.interaction.deferred)
            ) {
                await cnt.editMessage({
                    embeds: [
                        {
                            title: resultTitle,
                            description,
                            color: resultColor,
                            timestamp: resultTimestamp,
                        },
                    ],
                });
            } else {
                await cnt.sendMessage({
                    embeds: [
                        {
                            title: resultTitle,
                            description,
                            color: resultColor,
                            timestamp: resultTimestamp,
                        },
                    ],
                });
            }
            return;
        } catch (error) {
            client.logger.error('Failed to move player nodes:', error);
            if (
                cnt.interaction &&
                (cnt.interaction.replied || cnt.interaction.deferred)
            ) {
                await cnt.editMessage({
                    embeds: [
                        {
                            description: cnt.get("commands.movenode.error", {
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : cnt.get("commands.movenode.unknown_error"),
                            }),
                            color: this.client.color.red,
                        },
                    ],
                });
            } else {
                await cnt.sendMessage({
                    embeds: [
                        {
                            description: cnt.get("commands.movenode.error", {
                                error:
                                    error instanceof Error
                                        ? error.message
                                        : cnt.get("commands.movenode.unknown_error"),
                            }),
                            color: this.client.color.red,
                        },
                    ],
                });
            }
            return;
        }
    }
}
