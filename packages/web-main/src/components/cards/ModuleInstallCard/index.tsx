import { ModuleInstallationOutputDTO, ModuleOutputDTO } from '@takaro/apiclient';
import { Tooltip, Dialog, Button, IconButton, Card, useTheme } from '@takaro/lib-components';
import { PATHS } from 'paths';
import { FC, useState, MouseEvent } from 'react';
import { AiOutlineDelete as DeleteIcon, AiOutlineSetting as ConfigIcon } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { SpacedRow, ActionIconsContainer, CardBody } from '../style';
import { useGameServerModuleUninstall } from 'queries/gameservers';
import { useSelectedGameServer } from 'hooks/useSelectedGameServerContext';

interface IModuleCardProps {
  mod: ModuleOutputDTO;
  installation?: ModuleInstallationOutputDTO;
  onClick?: () => void;
}

export const ModuleInstallCard: FC<IModuleCardProps> = ({ mod, installation }) => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const { mutateAsync: uninstallModule, isLoading: isDeleting } = useGameServerModuleUninstall();
  const navigate = useNavigate();
  const { selectedGameServerId } = useSelectedGameServer();
  const theme = useTheme();

  const handleOnDelete = async (e: MouseEvent) => {
    e.stopPropagation();
    if (!installation) throw new Error('No installation found');
    await uninstallModule({
      gameServerId: installation.gameserverId,
      moduleId: mod.id,
    });
    setOpenDialog(false);
  };

  return (
    <>
      <Card data-testid={`module-${mod.id}`}>
        <CardBody>
          <h2>{mod.name}</h2>
          <p>{mod.description}</p>
          <SpacedRow>
            <span style={{ color: `${theme.colors.primary} !important` }}>
              {mod.commands.length > 0 && <p>Commands: {mod.commands.length}</p>}
              {mod.hooks.length > 0 && <p>Hooks: {mod.hooks.length}</p>}
              {mod.cronJobs.length > 0 && <p>Cronjobs: {mod.cronJobs.length}</p>}
            </span>
            <ActionIconsContainer>
              {installation ? (
                <>
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <IconButton
                        onClick={() => {
                          navigate(PATHS.gameServer.moduleInstallations.install(selectedGameServerId, mod.id));
                        }}
                        ariaLabel="Configure module"
                        icon={<ConfigIcon />}
                      />
                    </Tooltip.Trigger>
                    <Tooltip.Content>Configure</Tooltip.Content>
                  </Tooltip>
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenDialog(true);
                        }}
                        icon={<DeleteIcon key={`uninstall-module-icon-${mod.id}`} />}
                        ariaLabel="Uninstall module"
                      />
                    </Tooltip.Trigger>
                    <Tooltip.Content>Uninstall</Tooltip.Content>
                  </Tooltip>
                </>
              ) : (
                <Button
                  text="Install"
                  onClick={() => {
                    navigate(PATHS.gameServer.moduleInstallations.install(selectedGameServerId, mod.id));
                  }}
                />
              )}
            </ActionIconsContainer>
          </SpacedRow>
        </CardBody>
      </Card>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <Dialog.Content>
          <Dialog.Heading>Module uninstall</Dialog.Heading>
          <Dialog.Body>
            <p>
              Are you sure you want to uninstall the module <strong>{mod.name}</strong>? This action is irreversible!
            </p>
            <Button
              isLoading={isDeleting}
              onClick={(e) => handleOnDelete(e)}
              fullWidth
              text="Uninstall module"
              color="error"
            />
          </Dialog.Body>
        </Dialog.Content>
      </Dialog>
    </>
  );
};