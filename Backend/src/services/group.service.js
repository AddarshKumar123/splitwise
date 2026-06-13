import prisma from '../config/prisma.js';

export const createGroup = async (name, description, creatorId) => {
    const group = await prisma.group.create({
        data: {
            name,
            description,
            creatorId,
            members: {
                create: {
                    userId: creatorId
                }
            }
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            }
        }
    });

    return group;
};

export const getUserGroups = async (userId) => {
    const groups = await prisma.group.findMany({
        where: {
            members: {
                some: {
                    userId
                }
            }
        },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            },
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            _count: {
                select: {
                    expenses: true
                }
            }
        }
    });

    return groups;
};

export const getGroupById = async (groupId, userId) => {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
            members: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    }
                }
            },
            creator: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            _count: {
                select: {
                    expenses: true
                }
            }
        }
    });

    if (!group) {
        throw new Error('Group not found');
    }

    const isMember = group.members.some(member => member.userId === userId);
    if (!isMember) {
        throw new Error('Access denied');
    }

    return group;
};

export const getGroupExpenses = async (groupId, userId) => {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: { members: true }
    });

    if (!group) {
        throw new Error('Group not found');
    }

    const isMember = group.members.some(member => member.userId === userId);
    if (!isMember) {
        throw new Error('Access denied');
    }

    const expenses = await prisma.expense.findMany({
        where: { groupId },
        include: {
            payer: {
                select: { id: true, name: true, email: true }
            },
            participants: {
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    }
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return expenses;
};

export const renameGroup = async (groupId, name, userId) => {
    const group = await prisma.group.findUnique({
        where: { id: groupId }
    });

    if (!group) {
        throw new Error('Group not found');
    }

    if (group.creatorId !== userId) {
        throw new Error('Only creator can rename group');
    }

    const updatedGroup = await prisma.group.update({
        where: { id: groupId },
        data: { name }
    });

    return updatedGroup;
};

export const addMember = async (groupId, email, creatorId) => {
    const group = await prisma.group.findUnique({
        where: { id: groupId }
    });

    if (!group) {
        throw new Error('Group not found');
    }

    if (group.creatorId !== creatorId) {
        throw new Error('Only creator can add members');
    }

    const userToAdd = await prisma.user.findUnique({
        where: { email }
    });

    if (!userToAdd) {
        throw new Error('User not found');
    }

    const existingMember = await prisma.groupMember.findUnique({
        where: {
            groupId_userId: {
                groupId,
                userId: userToAdd.id
            }
        }
    });

    if (existingMember) {
        throw new Error('User is already a member');
    }

    const member = await prisma.groupMember.create({
        data: {
            groupId,
            userId: userToAdd.id
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        }
    });

    return member;
};

export const removeMember = async (groupId, memberUserId, creatorId) => {
    const group = await prisma.group.findUnique({
        where: { id: groupId }
    });

    if (!group) {
        throw new Error('Group not found');
    }

    if (group.creatorId !== creatorId) {
        throw new Error('Only creator can remove members');
    }

    if (memberUserId === creatorId) {
        throw new Error('Creator cannot remove themselves');
    }

    // TODO: Check balance = 0 (implement after Balance Engine)
    // For now, bypass this check

    await prisma.groupMember.delete({
        where: {
            groupId_userId: {
                groupId,
                userId: memberUserId
            }
        }
    });

    return { message: 'Member removed successfully' };
};

export const leaveGroup = async (groupId, userId) => {
    const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
            members: {
                orderBy: {
                    joinedAt: 'asc'
                }
            }
        }
    });

    if (!group) {
        throw new Error('Group not found');
    }

    const member = await prisma.groupMember.findUnique({
        where: {
            groupId_userId: {
                groupId,
                userId
            }
        }
    });

    if (!member) {
        throw new Error('User is not a member');
    }

    // TODO: Check balance = 0 (implement after Balance Engine)
    // For now, bypass this check

    if (group.creatorId === userId) {
        // Transfer ownership to oldest member
        if (group.members.length <= 1) {
            throw new Error('Creator cannot leave group with only one member');
        }

        const newCreator = group.members.find(m => m.userId !== userId);
        await prisma.group.update({
            where: { id: groupId },
            data: { creatorId: newCreator.userId }
        });
    }

    await prisma.groupMember.delete({
        where: {
            groupId_userId: {
                groupId,
                userId
            }
        }
    });

    return { message: 'Left group successfully' };
};

export const deleteGroup = async (groupId, userId) => {
    const group = await prisma.group.findUnique({
        where: { id: groupId }
    });

    if (!group) {
        throw new Error('Group not found');
    }

    if (group.creatorId !== userId) {
        throw new Error('Only creator can delete group');
    }

    // TODO: Check all balances = 0 (implement after Balance Engine)
    // For now, bypass this check

    await prisma.group.delete({
        where: { id: groupId }
    });

    return { message: 'Group deleted successfully' };
};
